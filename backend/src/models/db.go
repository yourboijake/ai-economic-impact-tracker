package models

import (
	"context"
	"fmt"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func CreateSeries(ctx context.Context, db *gorm.DB, series Series) (*Series, error) {
	err := gorm.G[Series](db).Create(ctx, &series)
	if err != nil {
		return nil, err
	}
	return &series, nil
}

func CreateObservations(db *gorm.DB, observations []Observation) error {
	result := db.Create(&observations)
	if result.Error != nil {
		fmt.Printf("Failed to create observations: %v\n", result.Error)
		return result.Error
	}
	return nil
}

func GetSeriesWithObservationsBySeriesID(db *gorm.DB, seriesID uint) (*SeriesWithObservations, error) {
	var series Series
	result := db.Preload("Observations").First(&series, seriesID)
	if result.Error != nil {
		return nil, result.Error
	}
	return &SeriesWithObservations{
		Series:       series,
		Observations: series.Observations,
	}, nil
}

func InitDB() (*gorm.DB, *context.Context, error) {
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	// db, err := gorm.Open(sqlite.Open("test.db"), &gorm.Config{})
	if err != nil {
		return nil, nil, err
	}

	ctx := context.Background()

	err = db.AutoMigrate(&Series{}, &Observation{})
	if err != nil {
		return nil, nil, err
	}

	// run initialization logic to populate db with initial data from CSVs
	CreateInitSeriesFromCSVs(ctx, db)

	return db, &ctx, nil
}
