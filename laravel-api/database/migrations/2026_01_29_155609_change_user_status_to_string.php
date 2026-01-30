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
        // Using raw SQL to avoid doctrine/dbal dependency issues
        DB::statement("ALTER TABLE users MODIFY COLUMN status VARCHAR(255) DEFAULT 'pending'");
    }

    public function down(): void
    {
        // Revert to boolean/tinyint if needed (assuming it was boolean)
        DB::statement("ALTER TABLE users MODIFY COLUMN status TINYINT(1) DEFAULT 1");
    }
};
