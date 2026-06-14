package catfacts

import (
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"time"
)

const (
	factsURL  = "https://catfact.ninja/fact"
	breedsURL = "https://catfact.ninja/breeds"
)

type Fact struct {
	ID     string `json:"id"`
	Text   string `json:"text"`
	Length int    `json:"length"`
}

type Breed struct {
	Breed   string `json:"breed"`
	Country string `json:"country"`
	Origin  string `json:"origin"`
	Coat    string `json:"coat"`
	Pattern string `json:"pattern"`
}

type Client struct {
	httpClient *http.Client
}

func NewClient() *Client {
	return &Client{
		httpClient: &http.Client{Timeout: 20 * time.Second},
	}
}

type factResponse struct {
	Fact   string `json:"fact"`
	Length int    `json:"length"`
}

type breedsPageResponse struct {
	Data        []Breed `json:"data"`
	CurrentPage int     `json:"current_page"`
	LastPage    int     `json:"last_page"`
}

func (c *Client) FetchFact(maxLength int) (Fact, error) {
	params := url.Values{}
	params.Set("max_length", strconv.Itoa(maxLength))

	req, err := http.NewRequest(http.MethodGet, factsURL+"?"+params.Encode(), nil)
	if err != nil {
		return Fact{}, err
	}

	res, err := c.httpClient.Do(req)
	if err != nil {
		return Fact{}, err
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return Fact{}, err
	}

	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return Fact{}, fmt.Errorf("cat facts request failed (%d)", res.StatusCode)
	}

	var payload factResponse
	if err := json.Unmarshal(body, &payload); err != nil {
		return Fact{}, err
	}

	text := payload.Fact
	if text == "" {
		return Fact{}, fmt.Errorf("empty cat fact response")
	}

	return Fact{
		ID:     hashID(text),
		Text:   text,
		Length: payload.Length,
	}, nil
}

func (c *Client) FetchAllBreeds() ([]Breed, error) {
	breeds := make([]Breed, 0, 98)
	page := 1

	for {
		params := url.Values{}
		params.Set("page", strconv.Itoa(page))

		req, err := http.NewRequest(http.MethodGet, breedsURL+"?"+params.Encode(), nil)
		if err != nil {
			return nil, err
		}

		res, err := c.httpClient.Do(req)
		if err != nil {
			return nil, err
		}

		body, err := io.ReadAll(res.Body)
		res.Body.Close()
		if err != nil {
			return nil, err
		}

		if res.StatusCode < 200 || res.StatusCode >= 300 {
			return nil, fmt.Errorf("cat breeds request failed (%d)", res.StatusCode)
		}

		var payload breedsPageResponse
		if err := json.Unmarshal(body, &payload); err != nil {
			return nil, err
		}

		if len(payload.Data) == 0 {
			break
		}

		breeds = append(breeds, payload.Data...)
		if page >= payload.LastPage {
			break
		}

		page++
	}

	return dedupeBreeds(breeds), nil
}

func dedupeBreeds(breeds []Breed) []Breed {
	seen := make(map[string]struct{}, len(breeds))
	out := make([]Breed, 0, len(breeds))

	for _, breed := range breeds {
		key := breed.Breed
		if _, ok := seen[key]; ok {
			continue
		}

		seen[key] = struct{}{}
		out = append(out, breed)
	}

	return out
}

func hashID(text string) string {
	if text == "" {
		return "fact-empty"
	}

	sum := sha1.Sum([]byte(text))
	return hex.EncodeToString(sum[:8])
}
