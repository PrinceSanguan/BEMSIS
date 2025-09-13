<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\TrackUserActivity::class,
        ]);

        // Add middleware alias for session activity
        $middleware->alias([
            'session.activity' => \App\Http\Middleware\SessionActivityMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->withCommands([
        \App\Console\Commands\MarkUsersOffline::class,
        \App\Console\Commands\SendEventReminders::class,
    ])
    ->withSchedule(function ($schedule) {
        // Mark users offline every minute
        $schedule->command('users:mark-offline --minutes=5')->everyMinute();

        // Send event reminders daily at 9:00 AM
        $schedule->command('events:send-reminders')
            ->dailyAt('09:00')
            ->withoutOverlapping()
            ->runInBackground();
    })
    ->create();
