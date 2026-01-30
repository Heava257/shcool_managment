<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Drop table if exists to ensure clean migration
        Schema::dropIfExists('otps');
        
        Schema::create('otps', function (Blueprint $table) {
            $table->id();
            $table->string('email', 255);
            $table->string('otp', 10);
            $table->timestamp('expires_at');
            $table->boolean('is_verified')->default(false);
            $table->timestamps();
            
            $table->index('email');
            $table->index('otp');
            $table->index('is_verified');
        });
    }

    public function down()
    {
        Schema::dropIfExists('otps');
    }
};