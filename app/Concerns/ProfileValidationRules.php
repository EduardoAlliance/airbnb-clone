<?php

namespace App\Concerns;

trait ProfileValidationRules
{
    /**
     * Get the validation rules used to validate user profiles.
     *
     * @return array<string, array<int, string>>
     */
    protected function profileRules(): array
    {
        return [
            'phone' => ['nullable', 'string', 'max:20'],
            'language' => ['nullable', 'string', 'max:10'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'first_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
        ];
    }
}
