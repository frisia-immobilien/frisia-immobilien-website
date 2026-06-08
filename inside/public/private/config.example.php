<?php

return [
    'app' => [
        'name' => 'Frisia Inside',
        'session_name' => 'FRISIA_INSIDE',
        'base_url' => 'https://frisia-inside.de',
        'setup_token' => 'CHANGE_ME_LONG_RANDOM_TOKEN',
        'cron_token' => 'CHANGE_ME_LONG_RANDOM_CRON_TOKEN',
        'website_snapshot_token' => '',
    ],
    'db' => [
        'dsn' => 'mysql:host=localhost;dbname=DATABASE_NAME;charset=utf8mb4',
        'user' => 'DATABASE_USER',
        'password' => 'DATABASE_PASSWORD',
    ],
    'openai' => [
        'api_key' => '',
        'model' => 'gpt-5.4-mini',
    ],
    'integrations' => [
        'propstack_api_key' => '',
        'google_search_console_property' => 'https://frisia-immobilien.de/',
    ],
];
