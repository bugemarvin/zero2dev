package main

import (
	"encoding/json"
	"net/http"
	"os"
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

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	// Add the four routes here:
	//   GET /notes, POST /notes, GET /notes/{id}, DELETE /notes/{id}

	http.ListenAndServe(os.Getenv("HOST")+":"+os.Getenv("PORT"), mux)
}
