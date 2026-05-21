<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('host_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('address');
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->nullable();
            $table->string('postal_code')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->unsignedSmallInteger('guests')->default(1);
            $table->unsignedSmallInteger('bedrooms')->default(1);
            $table->unsignedSmallInteger('beds')->default(1);
            $table->decimal('bathrooms', 4, 1)->default(1);
            $table->decimal('base_price', 10, 2)->default(0);
            $table->decimal('cleaning_fee', 10, 2)->default(0);
            $table->time('check_in_time')->nullable()->default('15:00:00');
            $table->time('check_out_time')->nullable()->default('11:00:00');
            $table->string('status')->default('draft');
            $table->timestamps();

            $table->index(['host_id', 'status']);
            $table->index(['country', 'state', 'city']);
        });

        Schema::create('property_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained('properties')->cascadeOnDelete();
            $table->string('disk')->default('public');
            $table->string('path');
            $table->string('type')->default('image');
            $table->string('alt_text')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_cover')->default(false);
            $table->timestamps();

            $table->index(['property_id', 'sort_order']);
        });

        Schema::create('amenities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('property_amenities_join', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained('properties')->cascadeOnDelete();
            $table->foreignId('amenity_id')->constrained('amenities')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['property_id', 'amenity_id']);
        });

        Schema::create('policies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('type');
            $table->text('description')->nullable();
            $table->json('rules')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['type', 'is_active']);
        });

        Schema::create('property_policies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained('properties')->cascadeOnDelete();
            $table->foreignId('policy_id')->constrained('policies')->cascadeOnDelete();
            $table->string('type')->nullable();
            $table->timestamps();

            $table->unique(['property_id', 'policy_id']);
        });

        Schema::create('inventory', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained('properties')->cascadeOnDelete();
            $table->date('date');
            $table->boolean('is_available')->default(true);
            $table->decimal('price', 10, 2)->default(0);
            $table->boolean('closed')->default(false);
            $table->timestamps();

            $table->unique(['property_id', 'date']);
            $table->index(['date', 'is_available', 'closed']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory');
        Schema::dropIfExists('property_policies');
        Schema::dropIfExists('policies');
        Schema::dropIfExists('property_amenities_join');
        Schema::dropIfExists('amenities');
        Schema::dropIfExists('property_media');
        Schema::dropIfExists('properties');
    }
};
