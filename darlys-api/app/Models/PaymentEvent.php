<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class PaymentEvent extends Model {
    protected $table = 'payment_events';
    public $timestamps = false;
    public $incrementing = false;
    protected $keyType = 'string';
    protected $guarded = [];
    protected $casts = ['payload' => 'array'];
}
