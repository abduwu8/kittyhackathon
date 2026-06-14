package groq

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"
)

const guideSystemPrompt = `You are the CodingKitty App Guide. You ONLY explain how to use this app. You never perform actions, fill forms, or save data for the user. Tell them exactly where to tap and what to do step by step.

You do NOT give general cat care advice. For health, food, or behavior questions, direct users to Cat Bot in the sidebar.

App overview:
- CodingKitty is a cat care dashboard with profile management, daily care tracking, and discovery content.
- Open the hamburger menu (top left) to reach every section.

Sections:
- Home: dashboard overview, care reminders, and quick links.
- Profile: cat name, breed, avatar, and photo gallery. Without a cat, this is the user profile.
- Litter: log litter box cleaning dates and habits.
- Medication: add medications with dosage, frequency, and notes.
- Vaccination: record vaccines with dates and due dates.
- Feeding: set a feeding schedule and enable reminders.
- Discover (Cats): browse cat photos and breeds.
- Cat Facts: read random cat facts.
- Stories: read comic stories about cats.
- Cat Bot: AI chat for cat health and care questions (not app help).

How to guide:
- Give clear numbered steps when explaining a task.
- Mention the menu path (e.g. "open the menu, tap feeding").
- Remind users to tap save after filling a form.
- Keep answers concise (under 130 words).
- Use warm, encouraging language with light cat wordplay.
- Never use em dashes or en dashes. Use commas or periods instead.
- Never claim you opened a screen or changed data. You only instruct the user.
- If asked about non-app topics, redirect to app features in one short sentence.`

var actionTagPattern = regexp.MustCompile(`(?i)\[\[action:[^\]]+\]\]`)

type GuideContext struct {
	HasCat           bool   `json:"hasCat"`
	CatName          string `json:"catName,omitempty"`
	UserName         string `json:"userName,omitempty"`
	FavoriteCatBreed string `json:"favoriteCatBreed,omitempty"`
	ActiveSection    string `json:"activeSection,omitempty"`
}

type GuideChatRequest struct {
	Messages []Message    `json:"messages"`
	Context  GuideContext `json:"context"`
}

type GuideClient struct {
	apiKey     string
	httpClient *http.Client
}

func NewGuideClient(apiKey string, httpClient *http.Client) *GuideClient {
	return &GuideClient{
		apiKey:     apiKey,
		httpClient: httpClient,
	}
}

func (c *GuideClient) Enabled() bool {
	return strings.TrimSpace(c.apiKey) != ""
}

func (c *GuideClient) Chat(req GuideChatRequest) (string, error) {
	if !c.Enabled() {
		return "", fmt.Errorf("guide groq api key is not configured")
	}

	payload := map[string]any{
		"model":       model,
		"temperature": 0.45,
		"max_tokens":  280,
		"messages": append([]Message{
			{Role: "system", Content: buildGuideSystemPrompt(req.Context)},
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
		return "", fmt.Errorf("guide groq request failed (%d): %s", res.StatusCode, string(body))
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
		return "", fmt.Errorf("guide groq returned an empty response")
	}

	return sanitizeGuideReply(parsed.Choices[0].Message.Content), nil
}

func buildGuideSystemPrompt(ctx GuideContext) string {
	details := make([]string, 0, 5)

	if ctx.HasCat {
		name := strings.TrimSpace(ctx.CatName)
		if name == "" {
			name = "their cat"
		}
		details = append(details, "The user has a cat named "+name+".")
	} else {
		details = append(details, "The user does not have a cat profile yet. Focus on profile setup and discovery features.")
	}

	if strings.TrimSpace(ctx.UserName) != "" {
		details = append(details, "The user's name is "+strings.TrimSpace(ctx.UserName)+".")
	}

	if strings.TrimSpace(ctx.FavoriteCatBreed) != "" {
		details = append(details, "Their favorite cat breed is "+strings.TrimSpace(ctx.FavoriteCatBreed)+".")
	}

	if section := strings.TrimSpace(ctx.ActiveSection); section != "" {
		details = append(details, "The user is currently on the "+section+" screen. Prioritize help for that area.")
	}

	if len(details) == 0 {
		return guideSystemPrompt
	}

	return guideSystemPrompt + "\n\nUser context:\n" + strings.Join(details, " ")
}

func sanitizeGuideReply(text string) string {
	replacer := strings.NewReplacer("—", ",", "–", ",")
	cleaned := replacer.Replace(text)
	cleaned = actionTagPattern.ReplaceAllString(cleaned, "")
	return strings.TrimSpace(cleaned)
}
