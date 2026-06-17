<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PersonalSubscription extends Model
{
    protected $fillable = [
        'name', 'amount', 'currency', 'billing_cycle', 'next_billing_date', 'color',
    ];

    protected $casts = [
        'next_billing_date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
