package app

import (
	"context"
	"log"
	"net/http"
	"time"

	"cat-app/internal/config"
	"cat-app/internal/middleware"
	"cat-app/internal/routes"
	"cat-app/internal/services/content"
	"cat-app/internal/services/groq"
	"cat-app/pkg/cache"

	"github.com/gofiber/fiber/v2"
)

type App struct {
	fiber   *fiber.App
	content *content.Service
}

func New(cfg config.Config) (*App, error) {
	memory := cache.NewMemory()
	contentService, err := content.NewService(cfg, memory)
	if err != nil {
		return nil, err
	}

	fiberApp := fiber.New(fiber.Config{
		AppName:      "CodingKitty API",
		ServerHeader: "CodingKitty",
	})

	middleware.Register(fiberApp, cfg.CORSOrigins, cfg.RateLimitPerMin)

	groqHTTP := &http.Client{Timeout: 45 * time.Second}

	routes.Register(fiberApp, routes.Dependencies{
		Content: contentService,
		Groq:    groq.NewClient(cfg.GroqAPIKey),
		Guide:   groq.NewGuideClient(cfg.GuideGroqAPIKey, groqHTTP),
	})

	return &App{
		fiber:   fiberApp,
		content: contentService,
	}, nil
}

func (a *App) Start(ctx context.Context, port string) error {
	a.content.Warm(ctx)

	log.Printf("CodingKitty API listening on :%s", port)
	return a.fiber.Listen(":" + port)
}

func (a *App) Shutdown() error {
	return a.fiber.Shutdown()
}
