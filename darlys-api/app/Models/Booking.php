<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Booking extends Model {
    protected $table = 'bookings';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $guarded = [];
    protected $casts = ['add_ons' => 'array', 'check_in' => 'date', 'check_out' => 'date'];
    public function room() { return $this->belongsTo(Room::class); }
}
