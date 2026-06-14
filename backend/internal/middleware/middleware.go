package middleware

import (
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/fiber/v2/middleware/requestid"
)

func Register(app *fiber.App, corsOrigins []string, rateLimitPerMin int) {
	app.Use(recover.New())
	app.Use(requestid.New())
	app.Use(logger.New(logger.Config{
		Format: "${time} | ${status} | ${latency} | ${ip} | ${method} ${path}\n",
	}))

	app.Use(cors.New(cors.Config{
		AllowOrigins: joinOrigins(corsOrigins),
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET,POST,OPTIONS",
	}))

	if rateLimitPerMin > 0 {
		app.Use(limiter.New(limiter.Config{
			Max:        rateLimitPerMin,
			Expiration: time.Minute,
			KeyGenerator: func(c *fiber.Ctx) string {
				return c.IP()
			},
		}))
	}
}

func joinOrigins(origins []string) string {
	if len(origins) == 0 {
		return "*"
	}

	return strings.Join(origins, ",")
}
