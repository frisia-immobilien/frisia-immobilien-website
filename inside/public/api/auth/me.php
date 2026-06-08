<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';

$user = current_user();
if (!$user) {
    json_response(['ok' => false, 'error' => 'Nicht angemeldet.'], 401);
}

json_response(['ok' => true, 'data' => $user]);
