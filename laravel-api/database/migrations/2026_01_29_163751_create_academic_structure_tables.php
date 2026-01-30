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
        // 1. Classes Table
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. "Grade 10A"
            $table->string('level')->nullable(); // e.g. "10"
            $table->foreignId('teacher_id')->nullable()->constrained('users'); // Homeroom teacher
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        // 2. Schedules Table
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained('users'); // Teacher for this class
            $table->enum('day_of_week', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
            $table->time('start_time');
            $table->time('end_time');
            $table->string('room')->nullable();
            $table->string('semester')->default('Semester 1');
            $table->string('academic_year')->nullable(); // e.g. "2024-2025"
            $table->timestamps();
        });

        // 3. Link Students to Classes
        Schema::table('students', function (Blueprint $table) {
             $table->foreignId('class_id')->nullable()->after('user_id')->constrained('classes')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropForeign(['class_id']);
            $table->dropColumn('class_id');
        });
        Schema::dropIfExists('schedules');
        Schema::dropIfExists('classes');
    }
};
