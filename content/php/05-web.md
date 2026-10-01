---
title: Requests, forms and JSON
summary: How PHP answers a browser: input, output, escaping, and why nothing is remembered between requests.
---

## One request, one run

When a request arrives, the web server starts your PHP script. The script produces a response and **ends**. The next request starts from zero: no variable survives.

This is the big difference from Node, Go or Java servers, which are one long-running program. In PHP, anything that must last goes into a database, a file, a cache or the session.

PHP has a server for development built in:

```console
$ php -S 127.0.0.1:8000 index.php
```

With a file name at the end, **every** request is handled by that file. It is then called a **router script** or front controller.

## Reading the request

| Source | Holds |
| --- | --- |
| `$_SERVER['REQUEST_METHOD']` | `GET`, `POST`, ... |
| `$_SERVER['REQUEST_URI']` | the path and query string: `/users?page=2` |
| `$_GET` | the query string as an array: `$_GET['page']` |
| `$_POST` | the fields of a submitted HTML form |
| `file_get_contents('php://input')` | the raw request body, for JSON |
| `$_COOKIE`, `$_FILES` | cookies and uploaded files |

```php
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];
$page = (int) ($_GET['page'] ?? 1);
```

Everything in these arrays comes from the user. **Never trust it.** Check it, convert it, and escape it before using it.

## An HTML page with a form

```php
<?php
$name = trim($_POST['name'] ?? '');
?>
<!doctype html>
<html lang="en">
<body>
  <?php if ($name !== ''): ?>
    <p>Hello, <?= htmlspecialchars($name) ?>!</p>
  <?php endif; ?>

  <form method="post">
    <label for="name">Your name</label>
    <input id="name" name="name">
    <button>Send</button>
  </form>
</body>
</html>
```

`<?= $x ?>` is short for `<?php echo $x ?>`.

## Escaping output

If a visitor types `<script>alert(1)</script>` as their name and you print it as it is, the browser runs it. That is **cross-site scripting (XSS)**, one of the most common security holes on the web.

**Every value that goes into HTML passes through `htmlspecialchars`.** It turns `<` into `&lt;` and so on, so the text is shown and never run. Template engines such as Twig and Blade do this automatically.

## Status and headers

```php
http_response_code(404);
header('Content-Type: application/json');
header('Location: /login');     // a redirect
```

Headers must be sent **before any output**. One space before `<?php` is output.

## A JSON API

```php
<?php
declare(strict_types=1);

function send(int $status, mixed $data): never
{
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($method === 'GET' && $path === '/health') {
    send(200, ['status' => 'ok']);
}

if ($method === 'POST' && $path === '/echo') {
    $body = json_decode(file_get_contents('php://input'), true);
    if (!is_array($body)) {
        send(400, ['error' => 'invalid JSON']);
    }
    send(201, $body);
}

send(404, ['error' => 'not found']);
```

- `json_decode($text, true)` gives arrays. It returns `null` when the text is not valid JSON.
- `json_encode` turns a list into `[...]` and an array with string keys into `{...}`. An **empty** array becomes `[]`.
- A path with a number in it: `preg_match('#^/users/(\d+)$#', $path, $m)` puts the number in `$m[1]`.

## Keeping data between requests

Since the script forgets everything, state lives outside it. The simplest store is a file:

```php
$file = getenv('DATA_DIR') . '/notes.json';
$notes = is_file($file) ? json_decode(file_get_contents($file), true) : [];
$notes[] = ['id' => count($notes) + 1, 'text' => 'hello'];
file_put_contents($file, json_encode($notes), LOCK_EX);
```

Real applications use a database, the subject of the next lesson.

## Sessions

A **session** remembers a visitor across requests. PHP stores the data on the server and gives the browser a cookie with the session's id:

```php
session_start();
$_SESSION['user_id'] = 42;      // readable on every later request of this visitor
```

## Common mistakes

- **Printing user input without `htmlspecialchars`.**
- **Expecting a variable to keep its value** until the next request.
- **Sending a header after output has started.** The warning is "headers already sent".
- **Forgetting `exit` after a redirect**, so the rest of the script still runs.
- **Trusting `$_GET` and `$_POST`** values to be the right type or to be present.
