<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'users.view',
            'users.manage',
            'properties.view',
            'properties.create',
            'properties.update',
            'properties.publish',
            'bookings.view',
            'bookings.create',
            'bookings.cancel',
            'payments.view',
            'payments.manage',
            'reviews.create',
            'reviews.moderate',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $roles = [
            'admin' => $permissions,
            'host' => [
                'properties.view',
                'properties.create',
                'properties.update',
                'properties.publish',
                'bookings.view',
                'payments.view',
                'reviews.create',
            ],
            'guest' => [
                'properties.view',
                'bookings.create',
                'bookings.cancel',
                'reviews.create',
            ],
        ];

        foreach ($roles as $name => $rolePermissions) {
            $role = Role::findOrCreate($name, 'web');
            $role->syncPermissions($rolePermissions);
        }
    }
}
