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
        // 1. Assessments Definition
        Schema::create('assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained();
            $table->foreignId('teacher_id')->constrained('users');
            $table->foreignId('class_id')->nullable()->constrained(); // Optional, linked to specific class
            
            $table->string('name'); // e.g. "Math Homework 1"
            $table->enum('type', ['homework', 'quiz', 'midterm', 'final', 'other']);
            $table->decimal('weight', 5, 2)->default(0); // e.g. 20.00 (%)
            $table->integer('max_score')->default(100);
            $table->date('due_date')->nullable();
            $table->string('semester')->default('Semester 1');
            $table->timestamps();
        });

        // 2. Student Scores
        Schema::create('student_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assessment_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->decimal('score', 8, 2)->nullable();
            $table->text('comment')->nullable();
            $table->timestamps();
            
            $table->unique(['assessment_id', 'student_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_scores');
        Schema::dropIfExists('assessments');
    }
};
