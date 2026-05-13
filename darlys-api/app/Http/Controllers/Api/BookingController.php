<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Support\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BookingController extends Controller {
    public function index(Request $r) {
        if (Admin::check($r->user()->id)) return Booking::orderByDesc('created_at')->get();
        return Booking::where('user_id', $r->user()->id)->orderByDesc('created_at')->get();
    }
    public function show($id, Request $r) {
        $b = Booking::findOrFail($id);
        abort_unless(Admin::check($r->user()?->id) || $b->user_id === $r->user()?->id, 403);
        return $b;
    }
    public function store(Request $r) {
        $d = $r->validate([
            'room_id'=>'required|uuid','guest_name'=>'required|string','guest_email'=>'required|email',
            'guest_phone'=>'nullable|string','check_in'=>'required|date','check_out'=>'required|date|after:check_in',
            'num_guests'=>'required|integer|min:1','total_price'=>'required|numeric|min:0',
            'special_requests'=>'nullable|string','add_ons'=>'nullable|array','user_id'=>'nullable|uuid',
        ]);
        $d['id'] = (string) Str::uuid();
        $d['status'] = 'pending';
        $d['payment_status'] = 'unpaid';
        return Booking::create($d);
    }
    public function update($id, Request $r) {
        abort_unless(Admin::check($r->user()?->id), 403);
        $b = Booking::findOrFail($id);
        $b->update($r->only(['status','payment_status','opera_confirmation_number','special_requests']));
        return $b;
    }
}
