package main

import (
	"encoding/json"
	"net/http"
	"os"
	"strconv"
	"sync"
)

type Note struct {
	ID   int    `json:"id"`
	Text string `json:"text"`
}

var (
	mu     sync.Mutex
	notes  = []Note{}
	nextID = 1
)

func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func notFound(w http.ResponseWriter) {
	writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
}

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	mux.HandleFunc("GET /notes", func(w http.ResponseWriter, r *http.Request) {
		mu.Lock()
		defer mu.Unlock()
		writeJSON(w, http.StatusOK, notes)
	})

	mux.HandleFunc("POST /notes", func(w http.ResponseWriter, r *http.Request) {
		var input struct {
			Text string `json:"text"`
		}
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON"})
			return
		}
		if input.Text == "" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "text is required"})
			return
		}
		mu.Lock()
		defer mu.Unlock()
		note := Note{ID: nextID, Text: input.Text}
		nextID++
		notes = append(notes, note)
		writeJSON(w, http.StatusCreated, note)
	})

	mux.HandleFunc("GET /notes/{id}", func(w http.ResponseWriter, r *http.Request) {
		id, _ := strconv.Atoi(r.PathValue("id"))
		mu.Lock()
		defer mu.Unlock()
		for _, note := range notes {
			if note.ID == id {
				writeJSON(w, http.StatusOK, note)
				return
			}
		}
		notFound(w)
	})

	mux.HandleFunc("DELETE /notes/{id}", func(w http.ResponseWriter, r *http.Request) {
		id, _ := strconv.Atoi(r.PathValue("id"))
		mu.Lock()
		defer mu.Unlock()
		kept := []Note{}
		for _, note := range notes {
			if note.ID != id {
				kept = append(kept, note)
			}
		}
		if len(kept) == len(notes) {
			notFound(w)
			return
		}
		notes = kept
		w.WriteHeader(http.StatusNoContent)
	})

	http.ListenAndServe(os.Getenv("HOST")+":"+os.Getenv("PORT"), mux)
}
