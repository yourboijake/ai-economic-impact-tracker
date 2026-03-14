package models

import (
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
	SeriesID uint    `json:"series_id"`
	Date     string  `json:"date"`
	Value    float64 `json:"value"`
}
