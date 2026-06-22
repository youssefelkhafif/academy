<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserClass extends Model
{
    //
    protected $table = "user_classes";
    protected $fillable = ["user_id","classes_id","role_id"];
}
