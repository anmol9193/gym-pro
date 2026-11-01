<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('phone', 30)->nullable()->index();
            $table->string('status', 20)->default('active')->index();
            $table->boolean('must_change_password')->default(false);
            $table->dropIndex(['is_admin']);
            $table->dropColumn('is_admin');
        });

        Schema::create('audit_logs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action')->index();
            $table->string('entity_type');
            $table->unsignedBigInteger('entity_id');
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->timestamps();
            $table->index(['entity_type', 'entity_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::table('users', function (Blueprint $table): void {
            $table->dropIndex(['phone']);
            $table->dropIndex(['status']);
            $table->dropColumn(['phone', 'status', 'must_change_password']);
            $table->boolean('is_admin')->default(false)->index();
        });
    }
};
