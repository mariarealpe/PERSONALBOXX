<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Schedule::call(function () {
    $backupPath = storage_path('app/backups/backup_' . date('Y-m-d_H-i-s') . '.sql');

    $command = 'C:\xampp\mysql\bin\mysqldump.exe -u root personal_box_db > "' . $backupPath . '"';

    exec($command);
})->dailyAt('02:00')->name('backup-db-diario');

Schedule::call(function () {
    $files = glob(storage_path('app/backups/*.sql'));

    foreach ($files as $file) {
        if (filemtime($file) < now()->subDays(7)->timestamp) {
            unlink($file);
        }
    }
})->dailyAt('02:30')->name('limpiar-backups-viejos');
