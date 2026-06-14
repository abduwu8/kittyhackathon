package response

import "github.com/gofiber/fiber/v2"

type envelope struct {
	Data  any    `json:"data,omitempty"`
	Error string `json:"error,omitempty"`
}

func JSON(c *fiber.Ctx, status int, data any) error {
	return c.Status(status).JSON(envelope{Data: data})
}

func Error(c *fiber.Ctx, status int, message string) error {
	return c.Status(status).JSON(envelope{Error: message})
}
