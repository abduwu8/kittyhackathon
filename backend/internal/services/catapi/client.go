package catapi

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"time"
)

const baseURL = "https://api.thecatapi.com/v1"

type Breed struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type Image struct {
	ID     string  `json:"id"`
	URL    string  `json:"url"`
	Width  int     `json:"width"`
	Height int     `json:"height"`
	Breeds []Breed `json:"breeds"`
}

type Client struct {
	apiKey     string
	httpClient *http.Client
}

func NewClient(apiKey string) *Client {
	return &Client{
		apiKey: apiKey,
		httpClient: &http.Client{
			Timeout: 20 * time.Second,
		},
	}
}

func (c *Client) Enabled() bool {
	return c.apiKey != ""
}

func (c *Client) SearchImages(limit, page int, breedQuery string) ([]Image, error) {
	if !c.Enabled() {
		return nil, fmt.Errorf("cat api key is not configured")
	}

	params := url.Values{}
	params.Set("size", "med")
	params.Set("mime_types", "jpg")
	params.Set("format", "json")
	params.Set("has_breeds", "true")
	params.Set("order", "RANDOM")
	params.Set("page", strconv.Itoa(page))
	params.Set("limit", strconv.Itoa(limit))

	if breedQuery != "" {
		breedID, err := c.searchBreedID(breedQuery)
		if err != nil {
			return nil, err
		}

		if breedID != "" {
			params.Set("breed_ids", breedID)
		}
	}

	var images []Image
	if err := c.getJSON("/images/search?"+params.Encode(), &images); err != nil {
		return nil, err
	}

	filtered := make([]Image, 0, len(images))
	for _, image := range images {
		if image.URL != "" {
			filtered = append(filtered, image)
		}
	}

	return filtered, nil
}

func (c *Client) searchBreedID(query string) (string, error) {
	params := url.Values{}
	params.Set("q", query)

	var breeds []Breed
	if err := c.getJSON("/breeds/search?"+params.Encode(), &breeds); err != nil {
		return "", err
	}

	if len(breeds) == 0 {
		return "", nil
	}

	return breeds[0].ID, nil
}

func (c *Client) getJSON(path string, dest any) error {
	req, err := http.NewRequest(http.MethodGet, baseURL+path, nil)
	if err != nil {
		return err
	}

	req.Header.Set("x-api-key", c.apiKey)

	res, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return err
	}

	if res.StatusCode == http.StatusTooManyRequests {
		return fmt.Errorf("cat api rate limit reached")
	}

	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return fmt.Errorf("cat api request failed (%d): %s", res.StatusCode, string(body))
	}

	return json.Unmarshal(body, dest)
}
