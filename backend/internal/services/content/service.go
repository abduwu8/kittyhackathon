package content

import (
	"context"
	"crypto/sha1"
	"encoding/hex"
	"fmt"
	"log"
	"math/rand"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"cat-app/internal/config"
	"cat-app/internal/services/catapi"
	"cat-app/internal/services/catfacts"
	"cat-app/pkg/cache"
)

type Service struct {
	cfg       config.Config
	cache     *cache.Memory
	catAPI    *catapi.Client
	catFacts  *catfacts.Client
	stories   storyCatalog
	factPool  []catfacts.Fact
	breedPool []catfacts.Breed
	mu        sync.RWMutex
}

func NewService(cfg config.Config, memory *cache.Memory) (*Service, error) {
	catalog, err := loadStoryCatalog()
	if err != nil {
		return nil, err
	}

	return &Service{
		cfg:      cfg,
		cache:    memory,
		catAPI:   catapi.NewClient(cfg.CatAPIKey),
		catFacts: catfacts.NewClient(),
		stories:  catalog,
	}, nil
}

func (s *Service) Warm(ctx context.Context) {
	go s.runPurgeLoop(ctx)
	go s.warmBreeds(ctx)
	go s.warmFacts(ctx)
}

func (s *Service) runPurgeLoop(ctx context.Context) {
	ticker := time.NewTicker(10 * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			if removed := s.cache.PurgeExpired(); removed > 0 {
				log.Printf("cache purged %d expired entries", removed)
			}
		}
	}
}

func (s *Service) warmBreeds(ctx context.Context) {
	cacheKey := "breeds:all"
	var cached []catfacts.Breed
	if s.cache.GetJSON(cacheKey, &cached) {
		s.mu.Lock()
		s.breedPool = cached
		s.mu.Unlock()
		return
	}

	breeds, err := s.catFacts.FetchAllBreeds()
	if err != nil {
		log.Printf("breed warmup skipped: %v", err)
		return
	}

	s.mu.Lock()
	s.breedPool = breeds
	s.mu.Unlock()

	if err := s.cache.SetJSON(cacheKey, breeds, s.cfg.CacheTTLBreeds); err != nil {
		log.Printf("breed cache write failed: %v", err)
	}

	log.Printf("cached %d cat breeds", len(breeds))
}

func (s *Service) warmFacts(ctx context.Context) {
	const target = 24
	facts := make([]catfacts.Fact, 0, target)

	for len(facts) < target {
		select {
		case <-ctx.Done():
			return
		default:
		}

		fact, err := s.catFacts.FetchFact(180)
		if err != nil {
			log.Printf("fact warmup stopped at %d: %v", len(facts), err)
			break
		}

		facts = append(facts, fact)
	}

	if len(facts) == 0 {
		return
	}

	s.mu.Lock()
	s.factPool = facts
	s.mu.Unlock()

	if err := s.cache.SetJSON("facts:pool", facts, s.cfg.CacheTTLFacts); err != nil {
		log.Printf("fact pool cache write failed: %v", err)
	}

	log.Printf("warmed fact pool with %d entries", len(facts))
}

func (s *Service) GetImages(limit, page int, breedQuery string) ([]catapi.Image, error) {
	if limit <= 0 {
		limit = 10
	}
	if limit > 25 {
		limit = 25
	}
	if page < 0 {
		page = 0
	}

	cacheKey := fmt.Sprintf("cats:images:%d:%d:%s", limit, page, strings.ToLower(strings.TrimSpace(breedQuery)))
	var cached []catapi.Image
	if s.cache.GetJSON(cacheKey, &cached) {
		return cached, nil
	}

	images, err := s.catAPI.SearchImages(limit, page, breedQuery)
	if err != nil {
		return nil, err
	}

	if err := s.cache.SetJSON(cacheKey, images, s.cfg.CacheTTLCats); err != nil {
		log.Printf("cat image cache write failed: %v", err)
	}

	return images, nil
}

func (s *Service) GetRandomFact(maxLength int) (catfacts.Fact, error) {
	if maxLength <= 0 {
		maxLength = 140
	}

	s.mu.RLock()
	pool := append([]catfacts.Fact(nil), s.factPool...)
	s.mu.RUnlock()

	if len(pool) > 0 {
		return pool[rand.Intn(len(pool))], nil
	}

	var cached []catfacts.Fact
	if s.cache.GetJSON("facts:pool", &cached) && len(cached) > 0 {
		return cached[rand.Intn(len(cached))], nil
	}

	fact, err := s.catFacts.FetchFact(maxLength)
	if err != nil {
		return catfacts.Fact{}, err
	}

	return fact, nil
}

func (s *Service) GetFacts(count, maxLength int) ([]catfacts.Fact, error) {
	if count <= 0 {
		count = 10
	}
	if count > 20 {
		count = 20
	}

	cacheKey := fmt.Sprintf("facts:batch:%d:%d", count, maxLength)
	var cached []catfacts.Fact
	if s.cache.GetJSON(cacheKey, &cached) {
		return cached, nil
	}

	facts := make([]catfacts.Fact, 0, count)
	seen := make(map[string]struct{}, count)

	for len(facts) < count {
		fact, err := s.GetRandomFact(maxLength)
		if err != nil {
			if len(facts) > 0 {
				break
			}
			return nil, err
		}

		key := strings.ToLower(fact.Text)
		if _, ok := seen[key]; ok {
			continue
		}

		seen[key] = struct{}{}
		facts = append(facts, fact)
	}

	if err := s.cache.SetJSON(cacheKey, facts, s.cfg.CacheTTLFacts); err != nil {
		log.Printf("facts batch cache write failed: %v", err)
	}

	return facts, nil
}

func (s *Service) GetBreeds() ([]catfacts.Breed, error) {
	s.mu.RLock()
	if len(s.breedPool) > 0 {
		out := append([]catfacts.Breed(nil), s.breedPool...)
		s.mu.RUnlock()
		return out, nil
	}
	s.mu.RUnlock()

	var cached []catfacts.Breed
	if s.cache.GetJSON("breeds:all", &cached) {
		return cached, nil
	}

	breeds, err := s.catFacts.FetchAllBreeds()
	if err != nil {
		return nil, err
	}

	s.mu.Lock()
	s.breedPool = breeds
	s.mu.Unlock()

	if err := s.cache.SetJSON("breeds:all", breeds, s.cfg.CacheTTLBreeds); err != nil {
		log.Printf("breeds cache write failed: %v", err)
	}

	return breeds, nil
}

func (s *Service) ListStories(baseURL string) []StorySummary {
	return s.stories.summaries(baseURL)
}

func (s *Service) GetStory(storyID, baseURL string) (StoryDetail, error) {
	return s.stories.detail(storyID, baseURL)
}

func (s *Service) StoryPosterPath(storyID string) (string, error) {
	story, ok := s.stories.byID[storyID]
	if !ok {
		return "", fmt.Errorf("story not found")
	}

	return filepath.Join(s.cfg.FrontendAssetsPath, "posters", story.PosterFile), nil
}

func (s *Service) StoryPanelPath(storyID string, panelID int) (string, error) {
	story, ok := s.stories.byID[storyID]
	if !ok {
		return "", fmt.Errorf("story not found")
	}

	for _, panel := range story.Panels {
		if panel.ID == panelID {
			return filepath.Join(s.cfg.FrontendAssetsPath, story.AssetDir, fmt.Sprintf("%d.png", panelID)), nil
		}
	}

	return "", fmt.Errorf("panel not found")
}

func hashFactID(text string) string {
	sum := sha1.Sum([]byte(text))
	return hex.EncodeToString(sum[:8])
}

func normalizeFact(fact catfacts.Fact) catfacts.Fact {
	if fact.ID == "" {
		fact.ID = hashFactID(fact.Text)
	}
	return fact
}

func normalizeFacts(facts []catfacts.Fact) []catfacts.Fact {
	out := make([]catfacts.Fact, len(facts))
	for i, fact := range facts {
		out[i] = normalizeFact(fact)
	}
	return out
}

func (s *Service) RandomFactForHandler(maxLength int) (catfacts.Fact, error) {
	fact, err := s.GetRandomFact(maxLength)
	if err != nil {
		return catfacts.Fact{}, err
	}
	return normalizeFact(fact), nil
}

func (s *Service) FactsForHandler(count, maxLength int) ([]catfacts.Fact, error) {
	facts, err := s.GetFacts(count, maxLength)
	if err != nil {
		return nil, err
	}
	return normalizeFacts(facts), nil
}

func init() {
	rand.Seed(time.Now().UnixNano())
}
