<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Support\Admin;
use Illuminate\Http\Request;

class RoomController extends Controller {
    public function index() { return Room::orderBy('name')->get(); }
    public function show($slug) { return Room::where('slug',$slug)->firstOrFail(); }

    public function store(Request $r) {
        abort_unless(Admin::check($r->user()?->id), 403);
        $data = $r->validate([
            'name'=>'required|string','slug'=>'required|string','category'=>'required|string',
            'size'=>'required|string','price_per_night'=>'required|numeric',
            'description'=>'nullable|string','max_guests'=>'integer','inventory_count'=>'integer',
            'amenities'=>'array','images'=>'array','is_available'=>'boolean',
            'group_discount_threshold'=>'integer','group_discount_percent'=>'numeric',
        ]);
        return Room::create($data);
    }
    public function update($id, Request $r) {
        abort_unless(Admin::check($r->user()?->id), 403);
        $room = Room::findOrFail($id);
        $room->update($r->all());
        return $room;
    }
    public function destroy($id, Request $r) {
        abort_unless(Admin::check($r->user()?->id), 403);
        Room::where('id',$id)->delete();
        return ['ok'=>true];
    }
}
