package routes

import (
	"cat-app/internal/handlers"
	"cat-app/internal/services/content"
	"cat-app/internal/services/groq"

	"github.com/gofiber/fiber/v2"
)

type Dependencies struct {
	Content *content.Service
	Groq    *groq.Client
	Guide   *groq.GuideClient
}

func Register(app *fiber.App, deps Dependencies) {
	app.Get("/health", handlers.Health{}.Handle)

	api := app.Group("/api/v1")

	cats := handlers.Cats{Content: deps.Content}
	api.Get("/cats/images", cats.Images)
	api.Get("/cats/facts/random", cats.RandomFact)
	api.Get("/cats/facts", cats.Facts)
	api.Get("/cats/breeds", cats.Breeds)

	stories := handlers.Stories{Content: deps.Content}
	api.Get("/stories", stories.List)
	api.Get("/stories/:id", stories.Detail)
	api.Get("/stories/:id/poster", stories.Poster)
	api.Get("/stories/:id/panels/:panelId/image", stories.PanelImage)

	catbot := handlers.CatBot{Groq: deps.Groq}
	api.Post("/catbot/chat", catbot.Chat)

	guide := handlers.Guide{Groq: deps.Guide}
	api.Post("/guide/chat", guide.Chat)
}
