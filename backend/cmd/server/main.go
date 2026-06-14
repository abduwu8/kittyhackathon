package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	apppkg "cat-app/internal/app"
	"cat-app/internal/config"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config load failed: %v", err)
	}

	application, err := apppkg.New(cfg)
	if err != nil {
		log.Fatalf("app init failed: %v", err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go func() {
		if err := application.Start(ctx, cfg.Port); err != nil {
			log.Fatalf("server failed: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	cancel()
	if err := application.Shutdown(); err != nil {
		log.Printf("shutdown error: %v", err)
	}
}
