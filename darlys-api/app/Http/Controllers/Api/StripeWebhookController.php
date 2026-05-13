<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\PaymentEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Stripe\Webhook;

class StripeWebhookController extends Controller {
    public function handle(Request $r) {
        $payload = $r->getContent();
        $sig = $r->header('Stripe-Signature');
        try {
            $event = Webhook::constructEvent($payload, $sig, env('STRIPE_WEBHOOK_SECRET'));
        } catch (\Throwable $e) {
            return response('invalid signature', 400);
        }

        $bookingId = $event->data->object->metadata->booking_id ?? null;

        PaymentEvent::create([
            'id' => (string) Str::uuid(),
            'stripe_event_id' => $event->id,
            'event_type' => $event->type,
            'booking_id' => $bookingId,
            'payload' => json_decode(json_encode($event->data->object), true),
        ]);

        if ($event->type === 'checkout.session.completed' && $bookingId) {
            Booking::where('id',$bookingId)->update(['status'=>'confirmed','payment_status'=>'paid']);
        }
        if ($event->type === 'charge.refunded' && $bookingId) {
            Booking::where('id',$bookingId)->update(['status'=>'cancelled','payment_status'=>'refunded']);
        }

        return ['received' => true];
    }
}
