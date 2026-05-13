<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class OperaSyncLog extends Model {
    protected $table = 'opera_sync_log';
    public $timestamps = false;
    public $incrementing = false;
    protected $keyType = 'string';
    protected $guarded = [];
    protected $casts = ['request_payload' => 'array', 'response_payload' => 'array'];
}
