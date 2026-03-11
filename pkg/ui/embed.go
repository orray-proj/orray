package ui

import (
	"embed"
	"io/fs"
	"net/http"
	"strings"
)

//go:embed all:dist
var distFS embed.FS

// Handler returns an http.Handler that serves the embedded UI assets.
// It falls back to index.html for SPA client-side routing.
func Handler() http.Handler {
	dist, err := fs.Sub(distFS, "dist")
	if err != nil {
		panic("failed to create sub filesystem for ui/dist: " + err.Error())
	}

	fileServer := http.FileServer(http.FS(dist))

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Try to serve the file directly
		path := strings.TrimPrefix(r.URL.Path, "/")
		if path == "" {
			path = "index.html"
		}

		// Check if the file exists
		if f, err := dist.Open(path); err == nil {
			_ = f.Close()
			fileServer.ServeHTTP(w, r)
			return
		}

		// SPA fallback: serve index.html for client-side routing
		r.URL.Path = "/"
		fileServer.ServeHTTP(w, r)
	})
}
