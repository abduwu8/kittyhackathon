package content

import (
	_ "embed"
	"encoding/json"
	"fmt"
	"strings"
)

//go:embed stories.json
var storiesJSON []byte

type panelDef struct {
	ID          int    `json:"id"`
	BorderColor string `json:"borderColor"`
	Width       int    `json:"width"`
	Height      int    `json:"height"`
}

type storyDef struct {
	ID          string     `json:"id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	LabelColor  string     `json:"labelColor"`
	AssetDir    string     `json:"assetDir"`
	PosterFile  string     `json:"posterFile"`
	Panels      []panelDef `json:"panels"`
	RowSlices   [][2]int   `json:"rowSlices"`
}

type storyCatalog struct {
	byID map[string]storyDef
	list []storyDef
}

type StorySummary struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	LabelColor  string `json:"labelColor"`
	PosterURL   string `json:"posterUrl"`
	PanelCount  int    `json:"panelCount"`
}

type StoryPanel struct {
	ID          int    `json:"id"`
	BorderColor string `json:"borderColor"`
	Width       int    `json:"width"`
	Height      int    `json:"height"`
	ImageURL    string `json:"imageUrl"`
}

type StoryDetail struct {
	ID          string         `json:"id"`
	Title       string         `json:"title"`
	Description string         `json:"description"`
	LabelColor  string         `json:"labelColor"`
	PosterURL   string         `json:"posterUrl"`
	Rows        [][]StoryPanel `json:"rows"`
}

func loadStoryCatalog() (storyCatalog, error) {
	var payload struct {
		Stories []storyDef `json:"stories"`
	}

	if err := json.Unmarshal(storiesJSON, &payload); err != nil {
		return storyCatalog{}, err
	}

	catalog := storyCatalog{
		byID: make(map[string]storyDef, len(payload.Stories)),
		list: payload.Stories,
	}

	for _, story := range payload.Stories {
		catalog.byID[story.ID] = story
	}

	return catalog, nil
}

func (c storyCatalog) summaries(baseURL string) []StorySummary {
	out := make([]StorySummary, 0, len(c.list))
	baseURL = strings.TrimRight(baseURL, "/")

	for _, story := range c.list {
		out = append(out, StorySummary{
			ID:          story.ID,
			Title:       story.Title,
			Description: story.Description,
			LabelColor:  story.LabelColor,
			PosterURL:   fmt.Sprintf("%s/api/v1/stories/%s/poster", baseURL, story.ID),
			PanelCount:  len(story.Panels),
		})
	}

	return out
}

func (c storyCatalog) detail(storyID, baseURL string) (StoryDetail, error) {
	story, ok := c.byID[storyID]
	if !ok {
		return StoryDetail{}, fmt.Errorf("story not found")
	}

	baseURL = strings.TrimRight(baseURL, "/")
	rows := make([][]StoryPanel, 0, len(story.RowSlices))

	for _, slice := range story.RowSlices {
		if len(slice) != 2 {
			continue
		}

		row := make([]StoryPanel, 0, slice[1]-slice[0])
		for _, panel := range story.Panels[slice[0]:slice[1]] {
			row = append(row, StoryPanel{
				ID:          panel.ID,
				BorderColor: panel.BorderColor,
				Width:       panel.Width,
				Height:      panel.Height,
				ImageURL:    fmt.Sprintf("%s/api/v1/stories/%s/panels/%d/image", baseURL, story.ID, panel.ID),
			})
		}

		rows = append(rows, row)
	}

	return StoryDetail{
		ID:          story.ID,
		Title:       story.Title,
		Description: story.Description,
		LabelColor:  story.LabelColor,
		PosterURL:   fmt.Sprintf("%s/api/v1/stories/%s/poster", baseURL, story.ID),
		Rows:        rows,
	}, nil
}
