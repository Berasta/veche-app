package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/livekit/protocol/auth"
	"github.com/livekit/protocol/webhook"
)

func main() {
	apiKey := os.Getenv("LIVEKIT_API_KEY")
	apiSecret := os.Getenv("LIVEKIT_API_SECRET")
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	if apiKey == "" || apiSecret == "" {
		log.Fatal("LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be set")
	}

	provider := auth.NewSimpleKeyProvider(apiKey, apiSecret)

	http.HandleFunc("/webhook", func(w http.ResponseWriter, r *http.Request) {
		ev, err := webhook.ReceiveWebhookEvent(r, provider)
		if err != nil {
			log.Printf("[ERROR] Webhook verification failed: %v", err)
			http.Error(w, "invalid webhook: "+err.Error(), 401)
			return
		}

		// Pretty print
		body, _ := io.ReadAll(r.Body)
		log.Printf("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
		log.Printf("📡 LiveKit Webhook at %s", time.Now().Format("15:04:05.000"))
		log.Printf("  Event: %s", ev.Event)
		log.Printf("  Room:  %+v", ev.Room)
		log.Printf("  Participant: %+v", ev.Participant)
		if len(body) > 0 {
			var pretty interface{}
			json.Unmarshal(body, &pretty)
			b, _ := json.MarshalIndent(pretty, "    ", "  ")
			log.Printf("  Raw:\n    %s", string(b))
		}
		log.Printf("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, "ok")
	})

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "LiveKit Webhook Debugger\nPOST /webhook  — receive webhooks\nGET /health — health check\n")
	})

	log.Printf("🚀 LiveKit webhook debugger on :%s", port)
	log.Printf("   Configure LiveKit: http://<this-host>:%s/webhook", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}
