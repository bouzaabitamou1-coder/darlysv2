<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AvailabilityController extends Controller {
    public function check(Request $r) {
        $d = $r->validate(['roomId'=>'required|uuid','checkIn'=>'required|date','checkOut'=>'required|date|after:checkIn']);
        DB::statement("SELECT public.cleanup_expired_locks()");
        $row = DB::selectOne("SELECT public.check_availability(?, ?, ?) AS available", [$d['roomId'], $d['checkIn'], $d['checkOut']]);
        return ['available' => (bool)$row->available];
    }
}
