<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register session activity middleware globally for web routes
        $this->app['router']->aliasMiddleware('session.activity', \App\Http\Middleware\SessionActivityMiddleware::class);
    }
}
