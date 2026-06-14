package groq

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

const apiURL = "https://api.groq.com/openai/v1/chat/completions"

const model = "llama-3.3-70b-versatile"

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatRequest struct {
	Messages []Message `json:"messages"`
	Context  ChatContext
}

type ChatContext struct {
	HasCat            bool   `json:"hasCat"`
	CatName           string `json:"catName,omitempty"`
	UserName          string `json:"userName,omitempty"`
	FavoriteCatBreed  string `json:"favoriteCatBreed,omitempty"`
}

type Client struct {
	apiKey     string
	httpClient *http.Client
}

func NewClient(apiKey string) *Client {
	return &Client{
		apiKey: apiKey,
		httpClient: &http.Client{
			Timeout: 45 * time.Second,
		},
	}
}

func (c *Client) Enabled() bool {
	return strings.TrimSpace(c.apiKey) != ""
}

func (c *Client) Chat(req ChatRequest) (string, error) {
	if !c.Enabled() {
		return "", fmt.Errorf("groq api key is not configured")
	}

	payload := map[string]any{
		"model":       model,
		"temperature": 0.6,
		"max_tokens":  220,
		"messages": append([]Message{
			{Role: "system", Content: buildSystemPrompt(req.Context)},
		}, req.Messages...),
	}

	raw, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	httpReq, err := http.NewRequest(http.MethodPost, apiURL, bytes.NewReader(raw))
	if err != nil {
		return "", err
	}

	httpReq.Header.Set("Authorization", "Bearer "+c.apiKey)
	httpReq.Header.Set("Content-Type", "application/json")

	res, err := c.httpClient.Do(httpReq)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return "", err
	}

	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return "", fmt.Errorf("groq request failed (%d): %s", res.StatusCode, string(body))
	}

	var parsed struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}

	if err := json.Unmarshal(body, &parsed); err != nil {
		return "", err
	}

	if len(parsed.Choices) == 0 || strings.TrimSpace(parsed.Choices[0].Message.Content) == "" {
		return "", fmt.Errorf("groq returned an empty response")
	}

	return sanitizeReply(parsed.Choices[0].Message.Content), nil
}

func buildSystemPrompt(ctx ChatContext) string {
	base := `You are Cat Bot, a helpful cat expert for all things feline.
Answer only cat-related questions: health, food, behavior, grooming, play, breeds, and daily care.
Keep replies concise (under 100 words). Use a warm, professional tone with light cat wordplay.
Never use em dashes or en dashes. Use commas or periods instead.
For emergencies, always advise seeing a vet immediately.
Politely decline non-cat topics in one short sentence.`

	if ctx.HasCat {
		name := strings.TrimSpace(ctx.CatName)
		if name == "" {
			name = "their cat"
		}

		return base + "\nThe user has a cat named " + name + ". You may refer to their cat by name when relevant."
	}

	details := []string{
		"The user does not currently have a cat. Do not assume they own a cat or say \"your cat\" unless they mention one in the conversation.",
	}

	if strings.TrimSpace(ctx.UserName) != "" {
		details = append(details, "The user's name is "+strings.TrimSpace(ctx.UserName)+".")
	}

	if strings.TrimSpace(ctx.FavoriteCatBreed) != "" {
		details = append(details, "Their favorite cat breed is "+strings.TrimSpace(ctx.FavoriteCatBreed)+". You may reference this interest when relevant.")
	}

	return base + "\n" + strings.Join(details, " ")
}

func sanitizeReply(text string) string {
	replacer := strings.NewReplacer("—", ",", "–", ",")
	return strings.TrimSpace(replacer.Replace(text))
}
