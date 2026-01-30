<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'role')) {
                $table->string('role')->default('pending_user')->after('email');
            }
            if (!Schema::hasColumn('users', 'status')) {
                $table->string('status')->default('pending')->after('role');
            }
            if (!Schema::hasColumn('users', 'registration_phase')) {
                $table->string('registration_phase')->default('phase_1')->after('status');
            }
            if (!Schema::hasColumn('users', 'verification_document')) {
                $table->string('verification_document')->nullable()->after('password');
            }
            if (!Schema::hasColumn('users', 'invitation_code_used')) {
                $table->string('invitation_code_used')->nullable()->after('verification_document');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'status', 'registration_phase', 'verification_document', 'invitation_code_used']);
        });
    }
};
