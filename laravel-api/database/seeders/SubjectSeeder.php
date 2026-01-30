<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Subject;

class SubjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $subjects = [
            [
                'name' => 'Mathematics',
                'code' => 'MATH101',
                'description' => 'Fundamental mathematics covering algebra, geometry, and calculus basics',
                'credits' => 3,
                'level' => 'beginner',
                'status' => 'active'
            ],
            [
                'name' => 'Advanced Mathematics',
                'code' => 'MATH201',
                'description' => 'Advanced topics in calculus, linear algebra, and differential equations',
                'credits' => 4,
                'level' => 'advanced',
                'status' => 'active'
            ],
            [
                'name' => 'English Literature',
                'code' => 'ENG101',
                'description' => 'Study of classic and contemporary English literature',
                'credits' => 3,
                'level' => 'beginner',
                'status' => 'active'
            ],
            [
                'name' => 'Physics',
                'code' => 'PHY101',
                'description' => 'Introduction to mechanics, thermodynamics, and electromagnetism',
                'credits' => 4,
                'level' => 'intermediate',
                'status' => 'active'
            ],
            [
                'name' => 'Chemistry',
                'code' => 'CHEM101',
                'description' => 'Fundamentals of organic and inorganic chemistry',
                'credits' => 3,
                'level' => 'intermediate',
                'status' => 'active'
            ],
            [
                'name' => 'Biology',
                'code' => 'BIO101',
                'description' => 'Introduction to cellular biology, genetics, and evolution',
                'credits' => 3,
                'level' => 'beginner',
                'status' => 'active'
            ],
            [
                'name' => 'Computer Science',
                'code' => 'CS101',
                'description' => 'Introduction to programming, algorithms, and data structures',
                'credits' => 4,
                'level' => 'beginner',
                'status' => 'active'
            ],
            [
                'name' => 'History',
                'code' => 'HIST101',
                'description' => 'World history from ancient civilizations to modern times',
                'credits' => 2,
                'level' => 'beginner',
                'status' => 'active'
            ],
            [
                'name' => 'Geography',
                'code' => 'GEOG101',
                'description' => 'Physical and human geography, including map reading skills',
                'credits' => 2,
                'level' => 'beginner',
                'status' => 'active'
            ],
            [
                'name' => 'Art & Design',
                'code' => 'ART101',
                'description' => 'Introduction to visual arts, design principles, and art history',
                'credits' => 2,
                'level' => 'beginner',
                'status' => 'active'
            ]
        ];

        foreach ($subjects as $subject) {
            Subject::create($subject);
        }
    }
}
