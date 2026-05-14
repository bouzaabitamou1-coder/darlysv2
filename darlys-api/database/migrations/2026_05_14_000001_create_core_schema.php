<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        DB::statement('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
        DB::statement('CREATE EXTENSION IF NOT EXISTS "btree_gist"');

        // users (Laravel auth target — replaces auth.users)
        Schema::create('users', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->string('name')->nullable();
            $t->string('email')->unique();
            $t->timestamp('email_verified_at')->nullable();
            $t->string('password');
            $t->rememberToken();
            $t->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $t) {
            $t->string('email')->primary();
            $t->string('token');
            $t->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $t) {
            $t->string('id')->primary();
            $t->uuid('user_id')->nullable()->index();
            $t->string('ip_address', 45)->nullable();
            $t->text('user_agent')->nullable();
            $t->longText('payload');
            $t->integer('last_activity')->index();
        });

        // App tables (mirror Supabase schema)
        Schema::create('profiles', function (Blueprint $t) {
            $t->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $t->uuid('user_id');
            $t->string('display_name')->nullable();
            $t->string('phone')->nullable();
            $t->string('role')->default('guest');
            $t->timestamps();
        });

        DB::statement("CREATE TYPE app_role AS ENUM ('admin','wholesaler','user')");

        Schema::create('user_roles', function (Blueprint $t) {
            $t->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $t->uuid('user_id');
            $t->unique(['user_id', 'role']);
        });
        DB::statement('ALTER TABLE user_roles ADD COLUMN role app_role NOT NULL');

        Schema::create('rooms', function (Blueprint $t) {
            $t->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $t->string('name');
            $t->string('slug')->unique();
            $t->string('category');
            $t->string('size');
            $t->text('description')->nullable();
            $t->decimal('price_per_night', 10, 2);
            $t->integer('max_guests')->default(2);
            $t->integer('inventory_count')->default(1);
            $t->integer('group_discount_threshold')->default(5);
            $t->decimal('group_discount_percent', 5, 2)->default(10);
            $t->boolean('is_available')->default(true);
            $t->jsonb('amenities')->default(DB::raw("'[]'::jsonb"));
            $t->jsonb('images')->default(DB::raw("'[]'::jsonb"));
            $t->timestamps();
        });

        Schema::create('bookings', function (Blueprint $t) {
            $t->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $t->uuid('room_id');
            $t->uuid('user_id')->nullable();
            $t->string('guest_name');
            $t->string('guest_email');
            $t->string('guest_phone')->nullable();
            $t->date('check_in');
            $t->date('check_out');
            $t->integer('num_guests')->default(1);
            $t->text('special_requests')->nullable();
            $t->decimal('total_price', 10, 2);
            $t->string('status')->default('pending');
            $t->string('payment_status')->default('unpaid');
            $t->string('payment_intent_id')->nullable();
            $t->string('stripe_checkout_session_id')->nullable();
            $t->string('opera_confirmation_number')->nullable();
            $t->jsonb('add_ons')->default(DB::raw("'[]'::jsonb"));
            $t->timestamps();
            $t->index(['room_id', 'check_in', 'check_out']);
            $t->foreign('room_id')->references('id')->on('rooms')->cascadeOnDelete();
        });

        Schema::create('contact_messages', function (Blueprint $t) {
            $t->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $t->string('name');
            $t->string('email');
            $t->string('subject')->nullable();
            $t->text('message');
            $t->boolean('is_read')->default(false);
            $t->timestamp('created_at')->useCurrent();
        });

        Schema::create('payment_events', function (Blueprint $t) {
            $t->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $t->uuid('booking_id')->nullable();
            $t->string('stripe_event_id')->unique();
            $t->string('event_type');
            $t->jsonb('payload');
            $t->timestamp('created_at')->useCurrent();
        });

        Schema::create('opera_sync_log', function (Blueprint $t) {
            $t->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $t->uuid('booking_id')->nullable();
            $t->string('action');
            $t->jsonb('request_payload')->nullable();
            $t->jsonb('response_payload')->nullable();
            $t->string('status')->default('pending');
            $t->text('error_message')->nullable();
            $t->timestamp('created_at')->useCurrent();
        });

        Schema::create('reservation_locks', function (Blueprint $t) {
            $t->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $t->uuid('room_id');
            $t->date('check_in');
            $t->date('check_out');
            $t->string('session_id');
            $t->timestamp('expires_at')->default(DB::raw("now() + interval '15 minutes'"));
            $t->timestamp('created_at')->useCurrent();
            $t->index(['room_id', 'check_in', 'check_out']);
        });

        // Cache (Laravel default, optional)
        Schema::create('cache', function (Blueprint $t) {
            $t->string('key')->primary();
            $t->mediumText('value');
            $t->integer('expiration');
        });
        Schema::create('cache_locks', function (Blueprint $t) {
            $t->string('key')->primary();
            $t->string('owner');
            $t->integer('expiration');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cache_locks');
        Schema::dropIfExists('cache');
        Schema::dropIfExists('reservation_locks');
        Schema::dropIfExists('opera_sync_log');
        Schema::dropIfExists('payment_events');
        Schema::dropIfExists('contact_messages');
        Schema::dropIfExists('bookings');
        Schema::dropIfExists('rooms');
        Schema::dropIfExists('user_roles');
        DB::statement('DROP TYPE IF EXISTS app_role');
        Schema::dropIfExists('profiles');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};