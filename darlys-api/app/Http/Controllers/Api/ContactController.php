<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Support\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ContactController extends Controller {
    public function store(Request $r) {
        $d = $r->validate(['name'=>'required|string','email'=>'required|email','subject'=>'nullable|string','message'=>'required|string']);
        $d['id'] = (string) Str::uuid();
        return ContactMessage::create($d);
    }
    public function index(Request $r) {
        abort_unless(Admin::check($r->user()?->id), 403);
        return ContactMessage::orderByDesc('created_at')->get();
    }
    public function update($id, Request $r) {
        abort_unless(Admin::check($r->user()?->id), 403);
        $m = ContactMessage::findOrFail($id);
        $m->update($r->only(['is_read']));
        return $m;
    }
}
