package config

import (
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Port               string
	Env                string
	CORSOrigins        []string
	CatAPIKey          string
	GroqAPIKey         string
	GuideGroqAPIKey    string
	FrontendAssetsPath string
	DatabaseURL        string
	CacheTTLCats       time.Duration
	CacheTTLFacts      time.Duration
	CacheTTLBreeds     time.Duration
	RateLimitPerMin    int
}

func Load() (Config, error) {
	_ = godotenv.Load()

	cfg := Config{
		Port:               getenv("PORT", "8080"),
		Env:                getenv("ENV", "development"),
		CatAPIKey:          os.Getenv("CAT_API_KEY"),
		GroqAPIKey:         os.Getenv("GROQ_API_KEY"),
		GuideGroqAPIKey:    os.Getenv("GUIDE_GROQ_API_KEY"),
		FrontendAssetsPath: getenv("FRONTEND_ASSETS_PATH", "../frontend/src"),
		DatabaseURL:        os.Getenv("DATABASE_URL"),
		RateLimitPerMin:    getenvInt("RATE_LIMIT_PER_MIN", 120),
	}

	cfg.CORSOrigins = splitCSV(getenv("CORS_ORIGINS", "*"))
	cfg.CacheTTLCats = getenvDuration("CACHE_TTL_CATS", 15*time.Minute)
	cfg.CacheTTLFacts = getenvDuration("CACHE_TTL_FACTS", time.Hour)
	cfg.CacheTTLBreeds = getenvDuration("CACHE_TTL_BREEDS", 24*time.Hour)

	return cfg, nil
}

func getenv(key, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}

	return fallback
}

func getenvInt(key string, fallback int) int {
	raw := strings.TrimSpace(os.Getenv(key))
	if raw == "" {
		return fallback
	}

	value, err := strconv.Atoi(raw)
	if err != nil {
		return fallback
	}

	return value
}

func getenvDuration(key string, fallback time.Duration) time.Duration {
	raw := strings.TrimSpace(os.Getenv(key))
	if raw == "" {
		return fallback
	}

	value, err := time.ParseDuration(raw)
	if err != nil {
		return fallback
	}

	return value
}

func splitCSV(raw string) []string {
	parts := strings.Split(raw, ",")
	out := make([]string, 0, len(parts))

	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed != "" {
			out = append(out, trimmed)
		}
	}

	if len(out) == 0 {
		return []string{"*"}
	}

	return out
}
