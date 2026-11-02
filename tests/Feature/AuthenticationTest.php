<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\SuperAdminSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['superadmin.email' => 'superadmin@gmail.com', 'superadmin.password' => 'test-admin-password']);
        $this->seed(SuperAdminSeeder::class);
    }

    public function test_super_admin_seeding_is_idempotent_and_hashes_the_password(): void
    {
        $this->seed(SuperAdminSeeder::class);
        $user = User::where('email', 'superadmin@gmail.com')->sole();

        $this->assertTrue($user->hasRole(Role::SUPER_ADMIN));
        $this->assertDatabaseCount('roles', 1);
        $this->assertDatabaseCount('model_has_roles', 1);
        $this->assertDatabaseHas('model_has_roles', [
            'role_id' => Role::where('name', Role::SUPER_ADMIN)->sole()->id,
            'model_type' => User::class,
            'model_id' => $user->id,
        ]);
        $this->assertTrue(Hash::check('test-admin-password', $user->password));
        $this->assertNotSame('test-admin-password', $user->password);
    }

    public function test_guests_can_see_login_but_cannot_access_the_dashboard(): void
    {
        $this->get('/login')->assertOk()->assertSee('Sign in')->assertSee('name="_token"', false);
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_super_admin_can_sign_in_and_access_the_dashboard(): void
    {
        $this->post('/login', ['email' => 'SUPERADMIN@gmail.com', 'password' => 'test-admin-password'])
            ->assertRedirect('/dashboard')->assertSessionHasNoErrors();
        $this->assertAuthenticatedAs(User::where('email', 'superadmin@gmail.com')->firstOrFail());
        $this->get('/dashboard')->assertOk()->assertSee('Super Admin')->assertSee('Super administrator')->assertSee('Sign out');
        $this->get('/login')->assertRedirect('/dashboard');
    }

    public function test_invalid_credentials_are_rejected_without_flashing_the_password(): void
    {
        $this->from('/login')->post('/login', ['email' => 'superadmin@gmail.com', 'password' => 'wrong-password'])
            ->assertRedirect('/login')->assertSessionHasErrors('email')->assertSessionMissing('_old_input.password');
        $this->assertGuest();
    }

    public function test_invalid_credentials_display_a_useful_message(): void
    {
        $this->followingRedirects()->from('/login')
            ->post('/login', ['email' => 'superadmin@gmail.com', 'password' => 'wrong-password'])
            ->assertOk()->assertSee('The email address or password is incorrect.');
    }

    public function test_login_validates_required_fields_and_email(): void
    {
        $this->post('/login', [])->assertSessionHasErrors(['email', 'password']);
        $this->post('/login', ['email' => 'invalid', 'password' => 'test'])
            ->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_members_cannot_sign_in_to_or_access_the_admin_dashboard(): void
    {
        $member = User::factory()->create(['password' => 'member-test-password']);
        $this->post('/login', ['email' => $member->email, 'password' => 'member-test-password'])
            ->assertSessionHasErrors('email');
        $this->assertGuest();
        $this->actingAs($member)->get('/dashboard')->assertForbidden();
    }

    public function test_login_attempts_are_throttled_and_success_clears_failures(): void
    {
        $this->freezeTime();
        $key = 'login:'.hash('sha256', 'superadmin@gmail.com|127.0.0.1');
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->post('/login', ['email' => 'superadmin@gmail.com', 'password' => 'wrong'])
                ->assertSessionHasErrors('email');
        }
        $this->post('/login', ['email' => 'superadmin@gmail.com', 'password' => 'test-admin-password'])
            ->assertSessionHasErrors(['email' => 'Too many login attempts. Try again in 60 seconds.']);
        $this->assertGuest();
        $this->travel(61)->seconds();
        $this->post('/login', ['email' => 'superadmin@gmail.com', 'password' => 'test-admin-password'])
            ->assertRedirect('/dashboard');
        $this->assertSame(0, RateLimiter::attempts($key));
    }

    public function test_sign_out_invalidates_authentication(): void
    {
        $this->actingAs(User::where('email', 'superadmin@gmail.com')->firstOrFail());
        $this->post('/logout')->assertRedirect('/login');
        $this->assertGuest();
        $this->get('/dashboard')->assertRedirect('/login');
        $this->get('/logout')->assertMethodNotAllowed();
    }

    public function test_auth_pages_are_not_stored_in_the_browser_cache(): void
    {
        $login = $this->get('/login')->assertOk();
        $this->assertStringContainsString('no-store', $login->headers->get('Cache-Control'));
        $login->assertHeader('Pragma', 'no-cache');
        $login->assertDontSee('assets/auth-history.js');

        $this->actingAs(User::where('email', 'superadmin@gmail.com')->sole());
        $dashboard = $this->get('/dashboard')->assertOk()->assertSee('assets/auth-history.js');
        $this->assertStringContainsString('no-store', $dashboard->headers->get('Cache-Control'));
        $dashboard->assertHeader('Pragma', 'no-cache');
        $dashboard->assertHeader('Expires', 'Thu, 01 Jan 1970 00:00:00 GMT');

        $logout = $this->post('/logout')->assertRedirect('/login');
        $this->assertStringContainsString('no-store', $logout->headers->get('Cache-Control'));
        $this->assertGuest();
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_cross_site_login_requires_a_csrf_token(): void
    {
        $this->app['env'] = 'local';

        $this->withHeader('Sec-Fetch-Site', 'cross-site')
            ->post('/login', ['email' => 'superadmin@gmail.com', 'password' => 'test-admin-password'])
            ->assertStatus(419);
        $this->assertGuest();
    }

    public function test_legacy_role_column_does_not_grant_admin_access(): void
    {
        $user = User::factory()->create(['password' => 'legacy-test-password']);
        $user->forceFill(['role' => 'super_admin'])->save();

        $this->post('/login', ['email' => $user->email, 'password' => 'legacy-test-password'])
            ->assertSessionHasErrors('email');
        $this->assertGuest();
        $this->actingAs($user)->get('/dashboard')->assertForbidden();
    }

    public function test_removing_the_role_revokes_dashboard_access(): void
    {
        $user = User::where('email', 'superadmin@gmail.com')->sole();
        $this->actingAs($user)->get('/dashboard')->assertOk();
        $user->roles()->detach();

        $this->get('/dashboard')->assertForbidden();
    }

    public function test_role_assignments_for_other_guards_or_model_types_do_not_grant_access(): void
    {
        $user = User::factory()->create(['password' => 'guard-test-password']);
        $apiRole = Role::create(['name' => Role::SUPER_ADMIN, 'guard_name' => 'api']);
        $user->roles()->attach($apiRole);
        DB::table('model_has_roles')->insert([
            'role_id' => Role::where('name', Role::SUPER_ADMIN)->where('guard_name', 'web')->sole()->id,
            'model_type' => 'OtherModel',
            'model_id' => $user->id,
        ]);

        $this->post('/login', ['email' => $user->email, 'password' => 'guard-test-password'])
            ->assertSessionHasErrors('email');
        $this->assertGuest();
    }
}
