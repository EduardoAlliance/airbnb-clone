<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Policy;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PolicyController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Policy::query();

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%");
            });
        }

        $paginator = $query->latest()->paginate(15);

        $policies = collect($paginator->items())->map(fn (Policy $p) => [
            'id' => $p->id,
            'name' => $p->name,
            'slug' => $p->slug,
            'type' => $p->type,
            'description' => $p->description,
            'rules' => $p->rules,
            'is_active' => $p->is_active,
            'created_at' => $p->created_at->format('M d, Y'),
        ]);

        return Inertia::render('admin/policies/index', [
            'policies' => [
                'data' => $policies,
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'total' => $paginator->total(),
                    'from' => $paginator->firstItem(),
                    'to' => $paginator->lastItem(),
                ],
            ],
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/policies/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:policies,slug'],
            'type' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'rules' => ['nullable', 'json'],
            'is_active' => ['boolean'],
        ]);

        $validated['rules'] = $validated['rules'] ? json_decode($validated['rules'], true) : [];
        $validated['is_active'] = $request->boolean('is_active', true);

        Policy::query()->create($validated);

        return to_route('admin.policies.index')
            ->with('flash', ['type' => 'success', 'message' => 'Policy created successfully.']);
    }

    public function edit(Policy $policy): Response
    {
        return Inertia::render('admin/policies/edit', [
            'policy' => [
                'id' => $policy->id,
                'name' => $policy->name,
                'slug' => $policy->slug,
                'type' => $policy->type,
                'description' => $policy->description,
                'rules' => $policy->rules,
                'is_active' => $policy->is_active,
            ],
        ]);
    }

    public function update(Request $request, Policy $policy): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:policies,slug,'.$policy->id],
            'type' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'rules' => ['nullable', 'json'],
            'is_active' => ['boolean'],
        ]);

        $validated['rules'] = $validated['rules'] ? json_decode($validated['rules'], true) : [];
        $validated['is_active'] = $request->boolean('is_active', true);

        $policy->update($validated);

        return to_route('admin.policies.index')
            ->with('flash', ['type' => 'success', 'message' => 'Policy updated successfully.']);
    }

    public function destroy(Policy $policy): RedirectResponse
    {
        $policy->delete();

        return back()->with('flash', ['type' => 'info', 'message' => 'Policy deleted.']);
    }
}
