<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Support\Admin;
use Illuminate\Http\Request;
use Stripe\StripeClient;

class RefundController extends Controller {
    public function process($id, Request $r) {
        abort_unless(Admin::check($r->user()?->id), 403);
        $b = Booking::findOrFail($id);
        if (!$b->payment_intent_id) return response()->json(['error'=>'No payment intent'], 400);
        $stripe = new StripeClient(env('STRIPE_SECRET'));
        $refund = $stripe->refunds->create(['payment_intent'=>$b->payment_intent_id]);
        $b->update(['status'=>'cancelled','payment_status'=>'refunded']);
        return ['refund'=>$refund->id,'booking'=>$b];
    }
}
