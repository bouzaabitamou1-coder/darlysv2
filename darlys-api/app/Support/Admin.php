<?php
namespace App\Support;
use App\Models\UserRole;
class Admin {
    public static function check($userId): bool {
        if (!$userId) return false;
        return UserRole::where('user_id', $userId)->where('role', 'admin')->exists();
    }
}
