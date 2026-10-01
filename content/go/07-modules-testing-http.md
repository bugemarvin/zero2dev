---
title: Modules, testing and an HTTP API
summary: Real projects: packages, dependencies, tests, and a web server from the standard library.
---

## Modules

A Go project is a **module**: a folder with a `go.mod` file that names it and lists its dependencies.

```console
$ mkdir todo && cd todo
$ go mod init example.com/todo
$ go get github.com/google/uuid       # add a dependency
$ go mod tidy                         # add what is missing, remove what is unused
```

`go.mod` and `go.sum` go into Git. `go.sum` holds checksums, so everyone builds exactly the same code.

## Packages

Every folder is one package. Files in the same folder share everything, with no imports between them.

```text
todo/
  go.mod
  main.go              package main
  store/
    store.go           package store
```

```go
// main.go
import "example.com/todo/store"

s := store.New()
```

Only capitalised names of `store` can be used from `main`.

| Command | Does |
| --- | --- |
| `go run .` | builds and runs the package in this folder |
| `go build ./...` | builds everything |
| `go test ./...` | runs every test |
| `go vet ./...` | reports suspicious code |
| `gofmt -l .` | lists files that are not formatted |

## Testing

Tests live next to the code, in files ending in `_test.go`, and need no library:

```go
// calc_test.go
package calc

import "testing"

func TestAdd(t *testing.T) {
	got := Add(2, 3)
	if got != 5 {
		t.Errorf("Add(2, 3) = %d, want 5", got)
	}
}
```

The Go habit is the **table-driven test**: one loop over many cases.

```go
func TestGrade(t *testing.T) {
	cases := []struct {
		score int
		want  string
	}{
		{95, "A"},
		{80, "B"},
		{10, "F"},
	}
	for _, c := range cases {
		if got := Grade(c.score); got != c.want {
			t.Errorf("Grade(%d) = %q, want %q", c.score, got, c.want)
		}
	}
}
```

```console
$ go test ./...
$ go test -run TestGrade -v
$ go test -race -cover ./...
```

## An HTTP server

The standard library has a production-quality web server. No framework is needed.

```go
package main

import (
	"encoding/json"
	"net/http"
	"os"
)

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	mux.HandleFunc("GET /users/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		writeJSON(w, http.StatusOK, map[string]string{"id": id})
	})

	addr := os.Getenv("HOST") + ":" + os.Getenv("PORT")
	http.ListenAndServe(addr, mux)
}

func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}
```

- A pattern such as `"GET /users/{id}"` matches a method and a path. `r.PathValue("id")` reads the part in braces. This needs Go 1.22 or later.
- Set headers first, then call `WriteHeader`, then write the body. The order matters.
- **Every request runs in its own goroutine.** Data shared between handlers needs a mutex.

## JSON

Struct tags say how fields are named in JSON:

```go
type Todo struct {
	ID    int    `json:"id"`
	Title string `json:"title"`
	Done  bool   `json:"done"`
}
```

Only capitalised fields are encoded. Reading a request body:

```go
var input struct {
	Title string `json:"title"`
}
if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
	writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON"})
	return
}
```

An empty slice that is `nil` is encoded as `null`. To get `[]`, create it with `[]Todo{}`.

## Common mistakes

- **Writing the body before the status.** The first write sends 200, and a later `WriteHeader` is ignored.
- **Forgetting `return` after sending an error response**, so the handler carries on.
- **A shared map with no mutex** in handlers. Concurrent map writes crash the program.
- **Lower-case struct fields**, which are silently left out of the JSON.
- **Listening on a fixed port.** Read it from the environment.
