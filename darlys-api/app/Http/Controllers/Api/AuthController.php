<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller {
    public function login(Request $req) {
        $data = $req->validate(['email'=>'required|email','password'=>'required|string']);
        if (!Auth::attempt($data, true)) {
            throw ValidationException::withMessages(['email' => 'Invalid credentials.']);
        }
        $req->session()->regenerate();
        $u = Auth::user();
        return ['user' => $u, 'isAdmin' => Admin::check($u->id)];
    }
    public function logout(Request $req) {
        Auth::guard('web')->logout();
        $req->session()->invalidate();
        $req->session()->regenerateToken();
        return ['ok' => true];
    }
    public function me(Request $req) {
        $u = $req->user();
        return ['user' => $u, 'isAdmin' => Admin::check($u?->id)];
    }
}
