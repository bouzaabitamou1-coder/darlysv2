<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ReservationLock extends Model {
    protected $table = 'reservation_locks';
    public $timestamps = false;
    public $incrementing = false;
    protected $keyType = 'string';
    protected $guarded = [];
}
