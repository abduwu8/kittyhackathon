package handlers

import (
	"strconv"
	"strings"

	"cat-app/internal/services/content"
	"cat-app/internal/services/groq"
	"cat-app/pkg/response"

	"github.com/gofiber/fiber/v2"
)

type Health struct{}

func (h Health) Handle(c *fiber.Ctx) error {
	return response.JSON(c, fiber.StatusOK, fiber.Map{
		"status": "ok",
	})
}

type Cats struct {
	Content *content.Service
}

func (h Cats) Images(c *fiber.Ctx) error {
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	page, _ := strconv.Atoi(c.Query("page", "0"))
	breed := c.Query("breed")

	images, err := h.Content.GetImages(limit, page, breed)
	if err != nil {
		return response.Error(c, fiber.StatusBadGateway, err.Error())
	}

	return response.JSON(c, fiber.StatusOK, images)
}

func (h Cats) RandomFact(c *fiber.Ctx) error {
	maxLength, _ := strconv.Atoi(c.Query("max_length", "140"))

	fact, err := h.Content.RandomFactForHandler(maxLength)
	if err != nil {
		return response.Error(c, fiber.StatusBadGateway, err.Error())
	}

	return response.JSON(c, fiber.StatusOK, fact)
}

func (h Cats) Facts(c *fiber.Ctx) error {
	count, _ := strconv.Atoi(c.Query("count", "10"))
	maxLength, _ := strconv.Atoi(c.Query("max_length", "140"))

	facts, err := h.Content.FactsForHandler(count, maxLength)
	if err != nil {
		return response.Error(c, fiber.StatusBadGateway, err.Error())
	}

	return response.JSON(c, fiber.StatusOK, facts)
}

func (h Cats) Breeds(c *fiber.Ctx) error {
	breeds, err := h.Content.GetBreeds()
	if err != nil {
		return response.Error(c, fiber.StatusBadGateway, err.Error())
	}

	return response.JSON(c, fiber.StatusOK, breeds)
}

type Stories struct {
	Content *content.Service
}

func (h Stories) List(c *fiber.Ctx) error {
	return response.JSON(c, fiber.StatusOK, h.Content.ListStories(baseURL(c)))
}

func (h Stories) Detail(c *fiber.Ctx) error {
	story, err := h.Content.GetStory(c.Params("id"), baseURL(c))
	if err != nil {
		return response.Error(c, fiber.StatusNotFound, err.Error())
	}

	return response.JSON(c, fiber.StatusOK, story)
}

func (h Stories) Poster(c *fiber.Ctx) error {
	path, err := h.Content.StoryPosterPath(c.Params("id"))
	if err != nil {
		return response.Error(c, fiber.StatusNotFound, err.Error())
	}

	c.Set("Cache-Control", "public, max-age=86400")
	return c.SendFile(path)
}

func (h Stories) PanelImage(c *fiber.Ctx) error {
	panelID, err := strconv.Atoi(c.Params("panelId"))
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "invalid panel id")
	}

	path, err := h.Content.StoryPanelPath(c.Params("id"), panelID)
	if err != nil {
		return response.Error(c, fiber.StatusNotFound, err.Error())
	}

	c.Set("Cache-Control", "public, max-age=86400")
	return c.SendFile(path)
}

type CatBot struct {
	Groq *groq.Client
}

type Guide struct {
	Groq *groq.GuideClient
}

func (h Guide) Chat(c *fiber.Ctx) error {
	var payload struct {
		Messages []groq.Message    `json:"messages"`
		Context  groq.GuideContext `json:"context"`
	}

	if err := c.BodyParser(&payload); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "invalid request body")
	}

	if len(payload.Messages) == 0 {
		return response.Error(c, fiber.StatusBadRequest, "messages are required")
	}

	reply, err := h.Groq.Chat(groq.GuideChatRequest{
		Messages: payload.Messages,
		Context:  payload.Context,
	})
	if err != nil {
		return response.Error(c, fiber.StatusBadGateway, err.Error())
	}

	return response.JSON(c, fiber.StatusOK, fiber.Map{"reply": reply})
}

func (h CatBot) Chat(c *fiber.Ctx) error {
	var payload struct {
		Messages []groq.Message  `json:"messages"`
		Context  groq.ChatContext  `json:"context"`
	}

	if err := c.BodyParser(&payload); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "invalid request body")
	}

	if len(payload.Messages) == 0 {
		return response.Error(c, fiber.StatusBadRequest, "messages are required")
	}

	reply, err := h.Groq.Chat(groq.ChatRequest{
		Messages: payload.Messages,
		Context:  payload.Context,
	})
	if err != nil {
		return response.Error(c, fiber.StatusBadGateway, err.Error())
	}

	return response.JSON(c, fiber.StatusOK, fiber.Map{"reply": reply})
}

func baseURL(c *fiber.Ctx) string {
	host := c.Hostname()
	if host == "" {
		return "http://localhost:8080"
	}

	scheme := c.Protocol()
	if scheme == "" {
		scheme = "http"
	}

	return scheme + "://" + strings.TrimSpace(host)
}
