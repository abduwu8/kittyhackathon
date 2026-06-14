package cache

import (
	"encoding/json"
	"sync"
	"time"
)

type entry struct {
	payload   []byte
	expiresAt time.Time
}

type Memory struct {
	mu    sync.RWMutex
	items map[string]entry
}

func NewMemory() *Memory {
	return &Memory{items: make(map[string]entry)}
}

func (m *Memory) Get(key string) ([]byte, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	item, ok := m.items[key]
	if !ok || time.Now().After(item.expiresAt) {
		return nil, false
	}

	return append([]byte(nil), item.payload...), true
}

func (m *Memory) Set(key string, payload []byte, ttl time.Duration) {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.items[key] = entry{
		payload:   append([]byte(nil), payload...),
		expiresAt: time.Now().Add(ttl),
	}
}

func (m *Memory) GetJSON(key string, dest any) bool {
	raw, ok := m.Get(key)
	if !ok {
		return false
	}

	return json.Unmarshal(raw, dest) == nil
}

func (m *Memory) SetJSON(key string, value any, ttl time.Duration) error {
	raw, err := json.Marshal(value)
	if err != nil {
		return err
	}

	m.Set(key, raw, ttl)
	return nil
}

func (m *Memory) Delete(key string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.items, key)
}

func (m *Memory) PurgeExpired() int {
	m.mu.Lock()
	defer m.mu.Unlock()

	now := time.Now()
	removed := 0

	for key, item := range m.items {
		if now.After(item.expiresAt) {
			delete(m.items, key)
			removed++
		}
	}

	return removed
}
