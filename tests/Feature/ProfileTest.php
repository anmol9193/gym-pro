<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['password' => 'old-password-123']);
        $this->admin->roles()->attach(Role::create(['name' => Role::SUPER_ADMIN, 'guard_name' => 'web']));
    }

    public function test_account_routes_require_an_administrator(): void
    {
        foreach (['/profile', '/change-password'] as $url) {
            $this->get($url)->assertRedirect('/login');
        }
        $this->patch('/profile', [])->assertRedirect('/login');
        $this->put('/change-password', [])->assertRedirect('/login');

        $this->actingAs(User::factory()->create());
        $this->get('/profile')->assertForbidden();
        $this->get('/change-password')->assertForbidden();
        $this->patch('/profile', [])->assertForbidden();
        $this->put('/change-password', [])->assertForbidden();
    }

    public function test_settings_pages_render_forms_without_browser_caching(): void
    {
        $this->actingAs($this->admin);
        foreach (['/profile', '/change-password'] as $url) {
            $response = $this->get($url)->assertOk()->assertSee('name="_token"', false);
            $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
        }
        $this->get('/dashboard')->assertSee('Change Password')->assertSee('Logout');
    }

    public function test_profile_updates_only_the_signed_in_users_allowed_fields(): void
    {
        $other = User::factory()->create();
        $otherName = $other->name;
        $passwordHash = $this->admin->password;
        $this->actingAs($this->admin)->patch('/profile', [
            'id' => $other->id,
            'name' => 'Updated Admin',
            'email' => 'UPDATED@example.test',
            'password' => 'injected-password',
            'role' => 'member',
        ])->assertRedirect('/profile')->assertSessionHasNoErrors()->assertSessionHas('status');

        $this->admin->refresh();
        $this->assertSame('Updated Admin', $this->admin->name);
        $this->assertSame('updated@example.test', $this->admin->email);
        $this->assertNull($this->admin->email_verified_at);
        $this->assertSame($passwordHash, $this->admin->password);
        $this->assertTrue($this->admin->hasRole(Role::SUPER_ADMIN));
        $this->assertSame($otherName, $other->fresh()->name);
    }

    public function test_profile_validates_email_uniqueness_and_field_types(): void
    {
        $other = User::factory()->create();
        $this->actingAs($this->admin);
        $this->patch('/profile', ['name' => 'Admin', 'email' => $other->email])->assertSessionHasErrors('email');
        $this->patch('/profile', ['name' => '', 'email' => ['invalid']])->assertSessionHasErrors(['name', 'email']);
        $this->patch('/profile', ['name' => 'Admin', 'email' => $this->admin->email])->assertSessionHasNoErrors();
        $this->assertNotNull($this->admin->fresh()->email_verified_at);
    }

    public function test_password_change_requires_the_current_password_and_does_not_flash_secrets(): void
    {
        $this->actingAs($this->admin)->from('/change-password')->put('/change-password', [
            'current_password' => 'incorrect-password',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ])->assertRedirect('/change-password')->assertSessionHasErrors('current_password')
            ->assertSessionMissing('_old_input.current_password')
            ->assertSessionMissing('_old_input.password')
            ->assertSessionMissing('_old_input.password_confirmation');
        $this->assertTrue(Hash::check('old-password-123', $this->admin->fresh()->password));
    }

    public function test_new_password_requires_length_confirmation_and_a_different_value(): void
    {
        $this->actingAs($this->admin);
        foreach ([['short', 'short'], ['new-password-123', 'mismatch'], ['old-password-123', 'old-password-123']] as [$password, $confirmation]) {
            $this->put('/change-password', [
                'current_password' => 'old-password-123',
                'password' => $password,
                'password_confirmation' => $confirmation,
            ])->assertSessionHasErrors('password');
        }
        $this->assertTrue(Hash::check('old-password-123', $this->admin->fresh()->password));
    }

    public function test_password_change_hashes_the_new_password_and_updates_login(): void
    {
        $oldToken = $this->admin->remember_token;
        $this->actingAs($this->admin)->put('/change-password', [
            'current_password' => 'old-password-123',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ])->assertRedirect('/change-password')->assertSessionHasNoErrors()->assertSessionHas('status');

        $this->admin->refresh();
        $this->assertTrue(Hash::check('new-password-123', $this->admin->password));
        $this->assertFalse(Hash::check('old-password-123', $this->admin->password));
        $this->assertNotSame($oldToken, $this->admin->remember_token);
        $this->post('/logout')->assertRedirect('/login');
        $this->post('/login', ['email' => $this->admin->email, 'password' => 'old-password-123'])->assertSessionHasErrors('email');
        $this->post('/login', ['email' => $this->admin->email, 'password' => 'new-password-123'])->assertRedirect('/dashboard');
    }

    public function test_profile_photo_upload_is_saved_and_rendered_on_all_account_surfaces(): void
    {
        Storage::fake('local');
        $this->actingAs($this->admin)->patch('/profile', [
            'name' => $this->admin->name,
            'email' => $this->admin->email,
            'avatar' => UploadedFile::fake()->image('photo.jpg', 120, 120),
        ])->assertRedirect('/profile')->assertSessionHasNoErrors();

        $path = $this->admin->fresh()->avatar_path;
        $this->assertStringStartsWith('profile-photos/', $path);
        Storage::disk('local')->assertExists($path);
        $this->get('/profile/photo')->assertOk()->assertHeader('Content-Type', 'image/jpeg')
            ->assertHeader('X-Content-Type-Options', 'nosniff');
        foreach (['/profile', '/dashboard', '/change-password'] as $url) {
            $this->get($url)->assertOk()->assertSee(route('profile.photo'), false);
        }
    }

    public function test_replacing_and_removing_photos_deletes_only_the_previous_photo(): void
    {
        Storage::fake('local');
        Storage::disk('local')->put('profile-photos/old.jpg', 'old photo');
        Storage::disk('local')->put('profile-photos/other.jpg', 'other account photo');
        $this->admin->forceFill(['avatar_path' => 'profile-photos/old.jpg'])->save();
        $this->actingAs($this->admin)->patch('/profile', [
            'name' => $this->admin->name, 'email' => $this->admin->email,
            'avatar' => UploadedFile::fake()->image('new.png', 100, 100),
        ])->assertSessionHasNoErrors();
        $path = $this->admin->fresh()->avatar_path;
        Storage::disk('local')->assertMissing('profile-photos/old.jpg');
        Storage::disk('local')->assertExists($path);

        $this->patch('/profile', [
            'name' => $this->admin->name, 'email' => $this->admin->email, 'remove_avatar' => '1',
        ])->assertSessionHasNoErrors();
        $this->assertNull($this->admin->fresh()->avatar_path);
        Storage::disk('local')->assertMissing($path);
        Storage::disk('local')->assertExists('profile-photos/other.jpg');
        $this->get('/profile/photo')->assertNotFound();
    }

    public function test_invalid_photos_leave_the_current_photo_unchanged(): void
    {
        Storage::fake('local');
        Storage::disk('local')->put('profile-photos/old.jpg', 'old photo');
        $this->admin->forceFill(['avatar_path' => 'profile-photos/old.jpg'])->save();
        $this->actingAs($this->admin);
        foreach ([
            UploadedFile::fake()->create('script.svg', 2, 'image/svg+xml'),
            UploadedFile::fake()->create('script.php', 2, 'application/x-php'),
            UploadedFile::fake()->image('large.jpg')->size(2049),
            UploadedFile::fake()->image('wide.png', 4100, 10),
        ] as $photo) {
            $this->patch('/profile', [
                'name' => $this->admin->name, 'email' => $this->admin->email, 'avatar' => $photo,
            ])->assertSessionHasErrors('avatar');
        }
        $this->assertSame('profile-photos/old.jpg', $this->admin->fresh()->avatar_path);
        Storage::disk('local')->assertExists('profile-photos/old.jpg');
    }

    public function test_private_photo_endpoint_does_not_expose_other_accounts_or_allow_guests(): void
    {
        Storage::fake('local');
        Storage::disk('local')->put('profile-photos/other.jpg', 'other photo');
        User::factory()->create()->forceFill(['avatar_path' => 'profile-photos/other.jpg'])->save();
        $this->get('/profile/photo')->assertRedirect('/login');
        $this->actingAs($this->admin)->get('/profile/photo?user_id=999')->assertNotFound();
    }
}
