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
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->integer("central_id");
            $table->string("name")->nullable()->default(null);
            $table->string("type")->nullable()->default(null);
            $table->integer("promo")->nullable()->default(null);
            $table->integer("class")->nullable()->default(null);
            $table->date("start_time")->nullable()->default(null);
            $table->date("end_time")->nullable()->default(null);
            $table->timestamps();
        });
    }

    

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('classes');
    }
};
