<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\ReservationLock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Stripe\StripeClient;

class CheckoutController extends Controller {
    public function create(Request $r) {
        $d = $r->validate([
            'bookingId'=>'required|uuid','roomName'=>'required|string','totalPrice'=>'required|numeric',
            'nights'=>'required|integer','guestEmail'=>'required|email','guestName'=>'nullable|string',
            'guestPhone'=>'nullable|string','roomId'=>'required|uuid',
            'checkIn'=>'required|date','checkOut'=>'required|date',
        ]);

        // conflict check
        $conflicts = Booking::where('room_id',$d['roomId'])
            ->whereIn('status',['pending','confirmed'])
            ->where('id','!=',$d['bookingId'])
            ->where('check_in','<',$d['checkOut'])->where('check_out','>',$d['checkIn'])
            ->exists();
        if ($conflicts) return response()->json(['error'=>'Room not available'], 409);

        ReservationLock::where('session_id',$d['bookingId'])->delete();
        ReservationLock::create([
            'id'=>(string)\Illuminate\Support\Str::uuid(),
            'room_id'=>$d['roomId'],'check_in'=>$d['checkIn'],'check_out'=>$d['checkOut'],
            'session_id'=>$d['bookingId'],
        ]);
        DB::statement("SELECT public.cleanup_expired_locks()");

        $stripe = new StripeClient(env('STRIPE_SECRET'));
        $origin = env('FRONTEND_URL');
        $session = $stripe->checkout->sessions->create([
            'customer_email' => $d['guestEmail'],
            'line_items' => [[
                'price_data' => [
                    'currency' => 'eur',
                    'product_data' => ['name' => "{$d['roomName']} - {$d['nights']} night(s)"],
                    'unit_amount' => (int) round($d['totalPrice'] * 100),
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => "$origin/booking-confirmation?id={$d['bookingId']}",
            'cancel_url'  => "$origin/booking",
            'metadata' => ['booking_id' => $d['bookingId']],
        ]);

        Booking::where('id',$d['bookingId'])->update([
            'stripe_checkout_session_id' => $session->id,
            'payment_intent_id' => is_string($session->payment_intent) ? $session->payment_intent : null,
        ]);

        // Telegram (non-blocking)
        try {
            $tok = env('TELEGRAM_BOT_TOKEN'); $chat = env('TELEGRAM_CHAT_ID');
            if ($tok && $chat) {
                Http::post("https://api.telegram.org/bot$tok/sendMessage", [
                    'chat_id' => $chat,
                    'parse_mode' => 'HTML',
                    'text' => "🔔 <b>New booking at Dar Lys</b>\n👤 ".e($d['guestName'] ?? $d['guestEmail'])
                        ."\n🛏 ".e($d['roomName'])."\n📅 {$d['checkIn']} → {$d['checkOut']} ({$d['nights']} n)"
                        ."\n💶 ".number_format($d['totalPrice'],2)." EUR",
                ]);
            }
        } catch (\Throwable $e) { /* ignore */ }

        return ['url' => $session->url];
    }
}
