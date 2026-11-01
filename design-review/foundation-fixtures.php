<?php

// Local browser QA only. Credentials stay on Laravel's private, ignored disk.
use App\Enums\UserRole;
use App\Models\User;
use App\Support\PasswordRules;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
if (! app()->environment('local') || config('database.default') !== 'mysql') {
    throw new RuntimeException('Browser fixtures require the local MySQL environment.');
}
$disk = Storage::disk('local');
$file = 'foundation-browser-fixtures.json';
$action = $argv[1] ?? '';
if ($action === 'cleanup') {
    foreach ($disk->exists($file) ? json_decode($disk->get($file), true, flags: JSON_THROW_ON_ERROR) : [] as $fixture) {
        $user = User::find($fixture['id']);
        if (! $user || $user->email !== $fixture['email'] || ! str_starts_with($user->email, 'qa.foundation.')) {
            continue;
        }
        DB::transaction(function () use ($user): void {
            DB::table('sessions')->where('user_id', $user->id)->delete();
            $user->delete();
        });
    }
    $disk->delete($file);
    echo "Local browser fixtures removed.\n";
} elseif ($action === 'create') {
    if ($disk->exists($file)) {
        throw new RuntimeException('Clean up the existing browser fixture set before creating another.');
    }
    $fixtures = DB::transaction(function (): array {
        $fixtures = [];
        foreach ([...UserRole::cases(), UserRole::Trainer] as $index => $role) {
            $password = PasswordRules::generate();
            $user = User::create(['name' => 'QA '.$role->label(), 'email' => 'qa.foundation.'.bin2hex(random_bytes(6)).'@example.test', 'password' => $password]);
            $user->forceFill(['must_change_password' => $index === 5])->save();
            $user->assignRole($role->value);
            $fixtures[] = ['id' => $user->id, 'email' => $user->email, 'password' => $password, 'role' => $role->value, 'forced' => $index === 5];
        }

        return $fixtures;
    });
    $disk->put($file, json_encode($fixtures, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR));
    echo "Local browser fixtures created on the private disk.\n";
} else {
    throw new InvalidArgumentException('Use create or cleanup.');
}
