<?php

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Artisan;

$root = dirname(__DIR__);
if (! is_file($root.'/.env')) {
    copy($root.'/.env.example', $root.'/.env');
}
require $root.'/vendor/autoload.php';
$app = require $root.'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
if (! app()->environment('local')) {
    throw new RuntimeException('composer setup is for local development. Use DEPLOYMENT.md for other environments.');
}
if (! config('app.key')) {
    Artisan::call('key:generate');
    echo Artisan::output();
} else {
    echo "Existing application key preserved.\n";
}
