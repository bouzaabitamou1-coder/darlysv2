<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Profile extends Model {
    protected $table = 'profiles';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $guarded = [];
}
