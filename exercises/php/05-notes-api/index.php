<?php
declare(strict_types=1);

// The folder for data comes from the environment. Each run of the tests gets an empty one.
$file = (getenv('DATA_DIR') ?: sys_get_temp_dir()) . '/notes.json';

function send(int $status, mixed $data = null): never
{
    http_response_code($status);
    if ($data !== null) {
        header('Content-Type: application/json');
        echo json_encode($data);
    }
    exit;
}

/** The stored state: ['next' => the next id, 'notes' => a list of notes]. */
function load(string $file): array
{
    if (!is_file($file)) {
        return ['next' => 1, 'notes' => []];
    }
    return json_decode(file_get_contents($file), true);
}

function save(string $file, array $state): void
{
    file_put_contents($file, json_encode($state), LOCK_EX);
}

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$state = load($file);

if ($method === 'GET' && $path === '/notes') {
    send(200, $state['notes']);
}

// Add: POST /notes, GET /notes/{id}, DELETE /notes/{id}

send(404, ['error' => 'not found']);
