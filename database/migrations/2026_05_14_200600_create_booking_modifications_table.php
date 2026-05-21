<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_modifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // 'dates', 'guests'
            $table->json('before');
            $table->json('after');
            $table->decimal('amount_change', 10, 2)->default(0);
            $table->foreignId('payment_method_id')->nullable()->constrained('user_payment_methods')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_modifications');
    }
};
