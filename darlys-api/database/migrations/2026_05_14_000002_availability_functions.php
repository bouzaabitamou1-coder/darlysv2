<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Removes locks older than 15 minutes
        DB::unprepared("
            CREATE OR REPLACE FUNCTION public.cleanup_expired_locks()
            RETURNS void
            LANGUAGE plpgsql
            AS \$\$
            BEGIN
                DELETE FROM public.reservation_locks WHERE expires_at < now();
            END;
            \$\$;
        ");

        // Returns true when the room has free inventory for [check_in, check_out)
        // taking confirmed/pending bookings AND active reservation_locks into account.
        DB::unprepared("
            CREATE OR REPLACE FUNCTION public.check_availability(
                _room_id uuid, _check_in date, _check_out date
            )
            RETURNS boolean
            LANGUAGE plpgsql
            AS \$\$
            DECLARE
                _inventory int;
                _used int;
            BEGIN
                SELECT inventory_count INTO _inventory FROM public.rooms WHERE id = _room_id;
                IF _inventory IS NULL THEN RETURN false; END IF;

                SELECT
                    COALESCE((SELECT count(*) FROM public.bookings
                        WHERE room_id = _room_id
                          AND status IN ('pending','confirmed')
                          AND check_in < _check_out AND check_out > _check_in), 0)
                  + COALESCE((SELECT count(*) FROM public.reservation_locks
                        WHERE room_id = _room_id
                          AND expires_at > now()
                          AND check_in < _check_out AND check_out > _check_in), 0)
                INTO _used;

                RETURN _used < _inventory;
            END;
            \$\$;
        ");
    }

    public function down(): void
    {
        DB::unprepared('DROP FUNCTION IF EXISTS public.check_availability(uuid, date, date)');
        DB::unprepared('DROP FUNCTION IF EXISTS public.cleanup_expired_locks()');
    }
};