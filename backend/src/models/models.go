// Package models defines data models + db integration for backend
package models

import (
	"time"

	"gorm.io/gorm"
)

type Series struct {
	gorm.Model
	Title        string        `json:"title"`
	Description  string        `json:"description"`
	Unit         string        `json:"unit"`
	Source       string        `json:"source"`
	Frequency    string        `json:"frequency"`
	Notes        string        `json:"notes"`
	Observations []Observation `json:"observations"`
}

type Observation struct {
	gorm.Model
	SeriesID uint      `json:"series_id"`
	Date     time.Time `json:"date"`
	Value    float64   `json:"value"`
}

type SeriesObservationsAPIResponse struct {
	Series       Series        `json:"series"`
	Observations []Observation `json:"observations"`
}
