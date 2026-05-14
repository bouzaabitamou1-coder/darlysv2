<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\PaymentEvent;
use App\Support\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Stripe\StripeClient;

class RefundController extends Controller {
    public function process($id, Request $r) {
        abort_unless(Admin::check($r->user()?->id), 403);
        $d = $r->validate([
            'amount' => 'nullable|numeric|min:0.01',
            'reason' => 'nullable|string',
        ]);
        $b = Booking::findOrFail($id);
        if (!$b->payment_intent_id) return response()->json(['error'=>'No payment intent'], 400);

        $stripe = new StripeClient(env('STRIPE_SECRET'));
        $params = [
            'payment_intent' => $b->payment_intent_id,
            'reason' => $d['reason'] ?? 'requested_by_customer',
        ];
        if (!empty($d['amount'])) $params['amount'] = (int) round($d['amount'] * 100);
        $refund = $stripe->refunds->create($params);

        $isFull = empty($d['amount']) || $d['amount'] >= (float) $b->total_price;
        $b->update([
            'status' => $isFull ? 'cancelled' : $b->status,
            'payment_status' => $isFull ? 'refunded' : 'partial_refund',
        ]);

        PaymentEvent::create([
            'id' => (string) Str::uuid(),
            'stripe_event_id' => $refund->id,
            'event_type' => $isFull ? 'refund.full' : 'refund.partial',
            'booking_id' => $b->id,
            'payload' => json_decode(json_encode($refund), true),
        ]);

        return ['refund' => $refund->id, 'amount' => $refund->amount / 100, 'booking' => $b];
    }
}
