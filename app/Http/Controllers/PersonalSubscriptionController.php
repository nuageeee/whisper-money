<?php

namespace App\Http\Controllers;

use App\Models\PersonalSubscription;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PersonalSubscriptionController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('PersonalSubscriptions/index', [
            'subscriptions' => $request->user()
                ->personalSubscriptions()
                ->orderBy('next_billing_date')
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'currency' => ['required', 'string', 'size:3'],
            'billing_cycle' => ['required', 'in:weekly,monthly,biweekly,yearly'],
            'next_billing_date' => ['required', 'date'],
            'color' => ['nullable', 'string', 'max:20'],
        ]);

        $request->user()->personalSubscriptions()->create($validated);

        return back();
    }

    public function destroy(Request $request, PersonalSubscription $personalSubscription)
    {
        abort_unless($personalSubscription->user_id === $request->user()->id, 403);
        $personalSubscription->delete();

        return back();
    }
}
