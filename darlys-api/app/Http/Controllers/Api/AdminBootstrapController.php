<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminBootstrapController extends Controller {
    public function run(Request $r) {
        if ($r->header('X-Bootstrap-Secret') !== env('ADMIN_BOOTSTRAP_SECRET')) abort(401);
        $d = $r->validate(['email'=>'required|email','password'=>'required|string|min:8','displayName'=>'nullable|string']);

        $user = DB::table('users')->where('email',$d['email'])->first();
        if ($user) {
            DB::table('users')->where('id',$user->id)->update(['password'=>Hash::make($d['password'])]);
            $userId = $user->id;
        } else {
            $userId = (string) Str::uuid();
            DB::table('users')->insert([
                'id'=>$userId,'email'=>$d['email'],'password'=>Hash::make($d['password']),
                'name'=>$d['displayName'] ?? 'Admin','created_at'=>now(),'updated_at'=>now(),
            ]);
        }
        UserRole::updateOrCreate(['user_id'=>$userId,'role'=>'admin'], ['id'=>(string)Str::uuid()]);
        return ['ok'=>true,'userId'=>$userId];
    }
}
