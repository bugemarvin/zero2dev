<?php
declare(strict_types=1);

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

if ($method === 'POST' && $path === '/notes') {
    $body = json_decode(file_get_contents('php://input'), true);
    if (!is_array($body)) {
        send(400, ['error' => 'invalid JSON']);
    }
    $text = trim((string) ($body['text'] ?? ''));
    if ($text === '') {
        send(400, ['error' => 'text is required']);
    }
    $note = ['id' => $state['next'], 'text' => $text];
    $state['next']++;
    $state['notes'][] = $note;
    save($file, $state);
    send(201, $note);
}

if (preg_match('#^/notes/(\d+)$#', $path, $m)) {
    $id = (int) $m[1];
    foreach ($state['notes'] as $index => $note) {
        if ($note['id'] !== $id) {
            continue;
        }
        if ($method === 'GET') {
            send(200, $note);
        }
        if ($method === 'DELETE') {
            unset($state['notes'][$index]);
            $state['notes'] = array_values($state['notes']);
            save($file, $state);
            send(204);
        }
    }
    send(404, ['error' => 'not found']);
}

send(404, ['error' => 'not found']);
