<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Room extends Model {
    protected $table = 'rooms';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $guarded = [];
    protected $casts = ['amenities' => 'array', 'images' => 'array', 'is_available' => 'bool'];
}
