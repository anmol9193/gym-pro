<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\AuditLog;
use App\Models\User;
use Database\Seeders\CatalogSeeder;
use Database\Seeders\DemoAccountsSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\DataProvider;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class FoundationTest extends TestCase
{
    use RefreshDatabase;

    private const PASSWORD = 'Test-Only!Password47';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RolePermissionSeeder::class, CatalogSeeder::class]);
    }

    private function account(UserRole $role, array $attributes = []): User
    {
        $user = User::factory()->create(['password' => self::PASSWORD, ...$attributes]);
        $user->assignRole($role->value);

        return $user;
    }

    public static function roles(): array
    {
        return array_map(fn ($role) => [$role], UserRole::cases());
    }

    public function test_seeders_are_idempotent_and_preserve_configured_permissions_and_catalog(): void
    {
        $role = Role::findByName('trainer');
        $role->revokePermissionTo('trainer.dashboard');
        DB::table('products')->where('slug', 'whey-protein')->update(['name' => 'Edited product']);
        $this->seed([RolePermissionSeeder::class, CatalogSeeder::class]);
        $this->assertSame(5, Role::count());
        $this->assertSame(11, Permission::count());
        $this->assertFalse($role->fresh()->hasPermissionTo('trainer.dashboard'));
        $this->assertDatabaseCount('products', 14);
        $this->assertDatabaseCount('programs', 6);
        $this->assertDatabaseHas('products', ['slug' => 'whey-protein', 'name' => 'Edited product']);
    }

    public function test_local_demo_passwords_are_random_hashed_and_require_change_without_rotating_on_reseed(): void
    {
        Storage::fake('local');
        $this->seed(DemoAccountsSeeder::class);
        $credentials = json_decode(Storage::disk('local')->get('local-demo-credentials.json'), true);
        $this->assertCount(6, $credentials);
        $this->assertCount(6, array_unique(array_column($credentials, 'initial_password')));
        foreach ($credentials as $credential) {
            $user = User::where('email', $credential['email'])->firstOrFail();
            $this->assertTrue(Hash::check($credential['initial_password'], $user->password));
            $this->assertTrue($user->must_change_password);
            $this->assertNotSame($credential['initial_password'], $user->password);
        }
        $hash = User::first()->password;
        $this->seed(DemoAccountsSeeder::class);
        $this->assertSame($hash, User::first()->password);
        $this->assertDatabaseCount('users', 6);
    }

    public function test_demo_seeding_is_refused_in_production(): void
    {
        $this->app->detectEnvironment(fn () => 'production');
        try {
            $this->expectException(\RuntimeException::class);
            (new DemoAccountsSeeder)->run();
        } finally {
            $this->app->detectEnvironment(fn () => 'testing');
        }
    }

    #[DataProvider('roles')]
    public function test_each_role_can_login_and_logout_with_correct_destination(UserRole $role): void
    {
        $user = $this->account($role);
        $this->post('/login', ['email' => strtoupper($user->email), 'password' => self::PASSWORD])
            ->assertRedirect(route($role->dashboardRoute()));
        $this->assertAuthenticatedAs($user);
        $this->get('/dashboard')->assertRedirect(route($role->dashboardRoute()));
        $this->post('/logout')->assertRedirect('/login');
        $this->assertGuest();
        $this->get(route($role->dashboardRoute()))->assertRedirect('/login');
    }

    #[DataProvider('roles')]
    public function test_role_boundaries_are_enforced_on_server(UserRole $role): void
    {
        $user = $this->account($role);
        $this->actingAs($user);
        foreach (['/admin/dashboard' => 'admin.dashboard', '/admin/users' => 'users.view', '/admin/roles' => 'roles.view', '/admin/settings' => 'settings.manage', '/receptionist/dashboard' => 'receptionist.dashboard', '/trainer/dashboard' => 'trainer.dashboard', '/member/dashboard' => 'member.dashboard'] as $path => $permission) {
            $response = $this->get($path);
            in_array($permission, $role->permissions(), true) ? $response->assertOk() : $response->assertForbidden();
        }
        $this->get('/account')->assertOk()->assertSee($user->email);
    }

    public function test_first_login_forces_password_change_and_password_change_revokes_sessions(): void
    {
        $user = $this->account(UserRole::GymAdmin, ['must_change_password' => true]);
        $this->post('/login', ['email' => $user->email, 'password' => self::PASSWORD])->assertRedirect('/account');
        $this->get('/admin/dashboard')->assertRedirect('/account');
        $this->get('/account')->assertOk();
        $this->patch('/account/password', ['current_password' => 'wrong', 'password' => 'short', 'password_confirmation' => 'different'])
            ->assertSessionHasErrors(['current_password', 'password']);
        config(['session.driver' => 'database']);
        DB::table('sessions')->insert(['id' => 'other-device', 'user_id' => $user->id, 'payload' => '', 'last_activity' => time()]);
        $this->patch('/account/password', ['current_password' => self::PASSWORD, 'password' => 'New-Only!Password49', 'password_confirmation' => 'New-Only!Password49'])
            ->assertRedirect('/login');
        $this->assertGuest();
        $this->assertFalse($user->fresh()->must_change_password);
        $this->assertTrue(Hash::check('New-Only!Password49', $user->fresh()->password));
        $this->assertDatabaseMissing('sessions', ['id' => 'other-device']);
        $this->assertDatabaseHas('audit_logs', ['action' => 'account.password-changed', 'entity_id' => $user->id]);
    }

    public function test_invalid_login_is_generic_and_rate_limited(): void
    {
        $user = $this->account(UserRole::Member);
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/login', ['email' => $user->email, 'password' => 'wrong'])
                ->assertUnprocessable()->assertJsonPath('errors.email.0', trans('auth.failed'));
        }
        $this->postJson('/login', ['email' => $user->email, 'password' => self::PASSWORD])->assertStatus(429)->assertSee('Too many login attempts');
        $this->assertGuest();
    }

    public function test_inactive_and_suspended_accounts_cannot_login_or_keep_an_existing_session(): void
    {
        foreach ([UserStatus::Inactive, UserStatus::Suspended] as $status) {
            $user = $this->account(UserRole::Member, ['status' => $status]);
            $this->postJson('/login', ['email' => $user->email, 'password' => self::PASSWORD])
                ->assertUnprocessable()->assertJsonPath('errors.email.0', trans('auth.failed'));
            $this->actingAs($user)->get('/member/dashboard')->assertRedirect('/login');
            $this->assertGuest();
        }
    }

    public function test_profile_updates_cannot_change_another_account_email_status_or_role(): void
    {
        $user = $this->account(UserRole::Member);
        $other = $this->account(UserRole::Trainer);
        $this->actingAs($user)->patch('/account', ['name' => '<script>alert(1)</script>', 'phone' => '+91 99999 99999', 'email' => $other->email, 'status' => 'suspended', 'role' => 'super-admin', 'id' => $other->id])
            ->assertRedirect();
        $user->refresh();
        $this->assertSame(UserStatus::Active, $user->status);
        $this->assertSame(UserRole::Member, $user->primaryRole());
        $this->assertNotSame($other->email, $user->email);
        $this->assertNotSame($user->name, $other->fresh()->name);
        $this->get('/account')->assertSee('&lt;script&gt;alert(1)&lt;/script&gt;', false)->assertDontSee('<script>alert(1)</script>', false);
        $this->patch('/admin/users/'.$other->id, ['role' => 'super-admin', 'status' => 'active'])->assertForbidden();
        $this->get('/account/'.$other->id)->assertNotFound();
    }

    public function test_gym_admin_can_create_a_staff_account_but_cannot_create_or_edit_super_admin_or_self_access(): void
    {
        $admin = $this->account(UserRole::GymAdmin);
        $super = $this->account(UserRole::SuperAdmin);
        $data = ['name' => 'New Staff', 'email' => 'staff@example.test', 'phone' => '9999999999', 'role' => 'trainer', 'password' => self::PASSWORD, 'password_confirmation' => self::PASSWORD];
        $this->actingAs($admin)->post('/admin/users', [...$data, 'role' => 'super-admin'])->assertForbidden();
        $this->assertDatabaseMissing('users', ['email' => $data['email']]);
        $this->post('/admin/users', $data)->assertRedirect('/admin/users');
        $created = User::where('email', $data['email'])->firstOrFail();
        $this->assertSame(UserRole::Trainer, $created->primaryRole());
        $this->assertTrue($created->must_change_password);
        $this->assertDatabaseHas('audit_logs', ['action' => 'account.created', 'entity_id' => $created->id, 'user_id' => $admin->id]);
        $this->post('/admin/users', $data)->assertSessionHasErrors('email');
        $this->post('/admin/users', [...$data, 'email' => strtoupper($data['email'])])->assertSessionHasErrors('email');
        foreach ([$super, $admin] as $target) {
            $this->get('/admin/users/'.$target->id.'/edit')->assertForbidden();
            $this->patch('/admin/users/'.$target->id, ['role' => 'member', 'status' => 'suspended'])->assertForbidden();
        }
        $this->patch('/admin/users/'.$created->id, ['role' => 'super-admin', 'status' => 'active'])->assertForbidden();
    }

    public function test_access_changes_are_audited_and_database_sessions_revoked(): void
    {
        $super = $this->account(UserRole::SuperAdmin);
        $target = $this->account(UserRole::Trainer);
        config(['session.driver' => 'database']);
        DB::table('sessions')->insert(['id' => 'staff-session', 'user_id' => $target->id, 'payload' => '', 'last_activity' => time()]);
        $this->actingAs($super)->patch('/admin/users/'.$target->id, ['role' => 'receptionist', 'status' => 'suspended'])->assertRedirect('/admin/users');
        $this->assertSame(UserStatus::Suspended, $target->fresh()->status);
        $this->assertSame(UserRole::Receptionist, $target->fresh()->primaryRole());
        $this->assertDatabaseMissing('sessions', ['id' => 'staff-session']);
        $audit = AuditLog::where('action', 'account.access-updated')->firstOrFail();
        $this->assertSame(['role' => 'trainer', 'status' => 'active'], $audit->old_values);
        $this->assertSame(['role' => 'receptionist', 'status' => 'suspended'], $audit->new_values);
        $this->assertStringNotContainsString('password', $audit->toJson());
    }

    public function test_only_super_admin_can_update_permissions_and_super_permissions_are_immutable(): void
    {
        $admin = $this->account(UserRole::GymAdmin);
        $trainerRole = Role::findByName('trainer');
        $this->actingAs($admin)->patch('/admin/roles/'.$trainerRole->id, ['permissions' => []])->assertForbidden();
        $super = $this->account(UserRole::SuperAdmin);
        $this->flushSession();
        $this->actingAs($super)->patch('/admin/roles/'.Role::findByName('super-admin')->id, ['permissions' => []])->assertForbidden();
        $this->patch('/admin/roles/'.$trainerRole->id, ['permissions' => ['unknown.permission']])->assertSessionHasErrors('permissions.0');
        $trainer = $this->account(UserRole::Trainer);
        $this->patch('/admin/roles/'.$trainerRole->id, ['permissions' => []])->assertRedirect();
        $this->assertDatabaseHas('audit_logs', ['action' => 'role.permissions-updated', 'entity_id' => $trainerRole->id]);
        $this->flushSession();
        $this->actingAs($trainer->fresh())->get('/trainer/dashboard')->assertForbidden();
    }

    public function test_password_reset_is_generic_token_hashed_single_use_and_password_policy_enforced(): void
    {
        Notification::fake();
        $user = $this->account(UserRole::Member, ['must_change_password' => true]);
        $known = $this->postJson('/forgot-password', ['email' => $user->email])->assertOk()->json('message');
        $unknown = $this->postJson('/forgot-password', ['email' => 'unknown@example.test'])->assertOk()->json('message');
        $this->assertSame($known, $unknown);
        $token = null;
        Notification::assertSentTo($user, ResetPassword::class, function ($notification) use (&$token) {
            $token = $notification->token;

            return true;
        });
        $this->assertNotSame($token, DB::table('password_reset_tokens')->where('email', $user->email)->value('token'));
        $data = ['email' => $user->email, 'token' => $token, 'password' => 'Reset-Only!Password55', 'password_confirmation' => 'Reset-Only!Password55'];
        $this->post('/reset-password', [...$data, 'password' => 'weak', 'password_confirmation' => 'weak'])->assertSessionHasErrors('password');
        $this->post('/reset-password', $data)->assertRedirect('/login');
        $this->assertTrue(Hash::check($data['password'], $user->fresh()->password));
        $this->assertFalse($user->fresh()->must_change_password);
        $this->post('/reset-password', $data)->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_expired_reset_tokens_and_disabled_account_resets_are_rejected(): void
    {
        $user = $this->account(UserRole::Member);
        $token = Password::createToken($user);
        $data = ['email' => $user->email, 'token' => $token, 'password' => self::PASSWORD, 'password_confirmation' => self::PASSWORD];
        $this->travel(61)->minutes();
        $this->post('/reset-password', $data)->assertSessionHasErrors('email');
        $this->travelBack();
        $token = Password::createToken($user);
        $user->forceFill(['status' => UserStatus::Suspended])->save();
        $this->post('/reset-password', [...$data, 'token' => $token])->assertSessionHasErrors('email');
    }

    public function test_reset_endpoint_is_rate_limited(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/forgot-password', ['email' => 'unknown@example.test'])->assertOk();
        }
        $this->postJson('/forgot-password', ['email' => 'unknown@example.test'])->assertUnprocessable()->assertSee('Too many password-reset requests');
    }

    public function test_guests_and_private_response_caching_and_registration_are_controlled(): void
    {
        foreach (['/dashboard', '/admin/users', '/account', '/trainer/dashboard'] as $path) {
            $this->get($path)->assertRedirect('/login');
        }
        $this->get('/register')->assertNotFound();
        $this->post('/register', [])->assertNotFound();
        $this->get('/login')->assertOk()->assertHeader('Cache-Control', 'max-age=0, must-revalidate, no-store, private');
        $this->actingAs($this->account(UserRole::Member))->get('/account')->assertOk()->assertHeader('Pragma', 'no-cache');
    }

    public function test_initial_admin_command_requires_a_strong_private_password_and_creates_an_audited_super_admin(): void
    {
        $this->artisan('gym:create-admin', ['email' => 'owner@example.test', '--name' => 'Gym Owner'])
            ->expectsQuestion('Choose a password (12+ characters, uppercase, lowercase, number and symbol)', self::PASSWORD)
            ->expectsQuestion('Confirm password', self::PASSWORD)
            ->expectsOutputToContain('Super Admin created.')
            ->assertSuccessful();
        $owner = User::where('email', 'owner@example.test')->firstOrFail();
        $this->assertTrue($owner->hasRole(UserRole::SuperAdmin->value));
        $this->assertTrue(Hash::check(self::PASSWORD, $owner->password));
        $this->assertDatabaseHas('audit_logs', ['action' => 'account.created-via-console', 'entity_id' => $owner->id]);
        $this->artisan('gym:create-admin', ['email' => 'weak@example.test'])
            ->expectsQuestion('Choose a password (12+ characters, uppercase, lowercase, number and symbol)', 'weak')
            ->expectsQuestion('Confirm password', 'weak')
            ->assertFailed();
        $this->assertDatabaseMissing('users', ['email' => 'weak@example.test']);
    }
}
