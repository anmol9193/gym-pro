<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

final class DatabaseSetupTest extends TestCase
{
    use RefreshDatabase;

    public function test_sqlite_migrations_and_eloquent_are_ready(): void
    {
        $this->assertTrue(Schema::hasTable('users'));
        $this->assertTrue(Schema::hasTable('jobs'));
        $this->assertTrue(Schema::hasTable('cache'));
        $user = User::factory()->create();
        $this->assertDatabaseHas('users', ['id' => $user->id]);
    }
}
