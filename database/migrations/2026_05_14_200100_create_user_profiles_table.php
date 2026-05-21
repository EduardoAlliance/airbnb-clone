<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->text('bio')->nullable();
            $table->string('avatar')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->boolean('notification_booking_confirmations')->default(true);
            $table->boolean('notification_cancellation_updates')->default(true);
            $table->boolean('notification_promotional_offers')->default(false);
            $table->boolean('notification_review_reminders')->default(true);
            $table->boolean('notification_newsletter')->default(false);
            $table->boolean('two_factor_email_enabled')->default(false);
            $table->timestamps();
        });

        Schema::create('user_payment_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('provider')->nullable();
            $table->string('stripe_customer_id')->nullable();
            $table->string('payment_method_token')->nullable();
            $table->string('brand')->nullable();
            $table->string('card_last4', 4)->nullable();
            $table->date('expires_at')->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'is_default']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_payment_methods');
        Schema::dropIfExists('user_profiles');
    }
};
