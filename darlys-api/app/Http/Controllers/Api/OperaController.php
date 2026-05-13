<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\OperaSyncLog;
use App\Support\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OperaController extends Controller {
    public function logs(Request $r) {
        abort_unless(Admin::check($r->user()?->id), 403);
        return OperaSyncLog::orderByDesc('created_at')->limit(200)->get();
    }
    public function sync(Request $r) {
        abort_unless(Admin::check($r->user()?->id), 403);
        $d = $r->validate(['booking_id'=>'required|uuid','action'=>'required|string']);
        $b = Booking::findOrFail($d['booking_id']);
        $payload = ['hotelCode'=>'DARLYS','reservation'=>$b->toArray()];
        $log = OperaSyncLog::create([
            'id'=>(string)Str::uuid(),'booking_id'=>$b->id,'action'=>$d['action'],
            'request_payload'=>$payload,'response_payload'=>['stub'=>true,'confirmation'=>'OPERA-'.strtoupper(substr($b->id,0,8))],
            'status'=>'success',
        ]);
        Booking::where('id',$b->id)->update(['opera_confirmation_number'=>$log->response_payload['confirmation']]);
        return $log;
    }
}
