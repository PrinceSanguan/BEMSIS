<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class MarkUsersOffline extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'users:mark-offline {--minutes=5 : Minutes of inactivity before marking offline}';

    /**
     * The console command description.
     */
    protected $description = 'Mark users as offline if they have been inactive for a specified period';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $minutes = $this->option('minutes');

        $this->info("Marking users offline who have been inactive for more than {$minutes} minutes...");

        $affectedUsers = User::where('is_online', true)
            ->where(function ($query) use ($minutes) {
                $query->whereNull('last_seen_at')
                    ->orWhere('last_seen_at', '<', now()->subMinutes($minutes));
            })
            ->update(['is_online' => false]);

        $this->info("Marked {$affectedUsers} users as offline.");

        return Command::SUCCESS;
    }
}
