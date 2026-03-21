package models

import (
	"context"
	"encoding/csv"
	"errors"
	"fmt"
	"os"
	"slices"
	"strconv"
	"strings"
	"time"

	"gorm.io/gorm"
)

type CSVTimeSeriesFile struct {
	Path            string
	DateColumnName  string
	ValueColumnName string
	DateLayout      string
}

type InitialSeries struct {
	Series
	CSVTimeSeriesFile
}

func parseObservation(dateStr, valueStr, dateLayout string) (Observation, error) {
	parsedDate, err := time.Parse(dateLayout, dateStr)
	if err != nil {
		return Observation{}, err
	}
	parsedValue, err := strconv.ParseFloat(strings.ReplaceAll(valueStr, ",", ""), 64)
	if err != nil {
		return Observation{}, err
	}

	observation := Observation{
		Date:  parsedDate,
		Value: parsedValue,
	}
	return observation, nil
}

func ReadObservationsFromCSV(csvFile CSVTimeSeriesFile, seriesID uint) ([]Observation, error) {
	file, err := os.Open(csvFile.Path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		return nil, err
	}

	dateColIndex := slices.Index(records[0], csvFile.DateColumnName)
	valueColIndex := slices.Index(records[0], csvFile.ValueColumnName)

	if dateColIndex == -1 || valueColIndex == -1 {
		fmt.Printf("Error: Date or Value column not found in CSV header. Date column index: %d, Value column index: %d\n\n", dateColIndex, valueColIndex)
		return nil, errors.New("date or value column not found in CSV header")
	}

	observations := make([]Observation, 0, len(records)-1)
	for i, record := range records[1:] {
		if len(record) <= dateColIndex || len(record) <= valueColIndex {
			fmt.Printf("Warning: Skipping row %d due to insufficient columns. Expected at least %d columns, got %d columns.\n\n", i+2, max(dateColIndex, valueColIndex)+1, len(record))
			continue
		}
		date := record[dateColIndex]
		value := record[valueColIndex]

		observation, err := parseObservation(date, value, csvFile.DateLayout)
		if err != nil {
			fmt.Printf("Warning: Skipping row %d due to parse error. Date: %s, Value: %s, Error: %v\n\n", i+2, date, value, err)
			continue
		}
		observation.SeriesID = seriesID
		observations = append(observations, observation)
	}

	if len(observations) == 0 {
		fmt.Printf("Warning: No valid observations found in CSV %s\n\n", csvFile.Path)
		return nil, errors.New("no valid observations found in CSV")
	}
	return observations, nil
}

func CreateInitSeriesFromCSVs(ctx context.Context, db *gorm.DB) {
	initialSeries := []InitialSeries{
		{
			Series: Series{
				Title:       "Young Workers Unemployment Rate",
				Description: "Unemployment rates of young workers (age 22-27 without a bachelor's degree)",
				Unit:        "Percentage",
				Source:      "U.S. Census Bureau and U.S. Bureau of Labor Statistics, Current Population Survey (IPUMS)",
				SourceURL:   "https://www.newyorkfed.org/research/college-labor-market#--:explore:unemployment",
				Frequency:   "Monthly",
				Notes:       "Rates are seasonally adjusted and smoothed with a three-month moving average. Young workers are those aged 22 to 27 without a bachelor's degree. All figures exclude those currently enrolled in school. October 2025 results are estimated due to missing data.",
			},
			CSVTimeSeriesFile: CSVTimeSeriesFile{
				Path:            "backend/ingestion_files/unemployment-by-career-stage.csv",
				DateColumnName:  "Date",
				ValueColumnName: "Young workers",
				DateLayout:      "1/1/2006",
			},
		},
		{
			Series: Series{
				Title:       "All Workers Unemployment Rate",
				Description: "Unemployment rates of all workers",
				Unit:        "Percentage",
				Source:      "U.S. Census Bureau and U.S. Bureau of Labor Statistics, Current Population Survey (IPUMS)",
				SourceURL:   "https://www.newyorkfed.org/research/college-labor-market#--:explore:unemployment",
				Frequency:   "Monthly",
				Notes:       "Rates are seasonally adjusted and smoothed with a three-month moving average. All workers are those aged 16 to 65. All figures exclude those currently enrolled in school. October 2025 results are estimated due to missing data.",
			},
			CSVTimeSeriesFile: CSVTimeSeriesFile{
				Path:            "backend/ingestion_files/unemployment-by-career-stage.csv",
				DateColumnName:  "Date",
				ValueColumnName: "All workers",
				DateLayout:      "1/1/2006",
			},
		},
		{
			Series: Series{
				Title:       "Recent Graduates Unemployment Rate",
				Description: "Unemployment rates of recent college graduates",
				Unit:        "Percentage",
				Source:      "U.S. Census Bureau and U.S. Bureau of Labor Statistics, Current Population Survey (IPUMS)",

				SourceURL: "https://www.newyorkfed.org/research/college-labor-market#--:explore:unemployment",

				Frequency: "Monthly",
				Notes:     "Rates are seasonally adjusted and smoothed with a three-month moving average. Recent college graduates are those aged 22 to 27 with a bachelor's degree or higher. All figures exclude those currently enrolled in school. October 2025 results are estimated due to missing data.",
			},
			CSVTimeSeriesFile: CSVTimeSeriesFile{
				Path:            "backend/ingestion_files/unemployment-by-career-stage.csv",
				DateColumnName:  "Date",
				ValueColumnName: "Recent graduates",
				DateLayout:      "1/1/2006",
			},
		},
		{
			Series: Series{
				Title:       "College Graduates Unemployment Rate",
				Description: "Unemployment rates of all college graduates",
				Unit:        "Percentage",
				Source:      "U.S. Census Bureau and U.S. Bureau of Labor Statistics, Current Population Survey (IPUMS)",

				SourceURL: "https://www.newyorkfed.org/research/college-labor-market#--:explore:unemployment",
				Frequency: "Monthly",
				Notes:     "Rates are seasonally adjusted and smoothed with a three-month moving average. College graduates are those aged 22 to 65 with a bachelor's degree or higher. All figures exclude those currently enrolled in school. October 2025 results are estimated due to missing data.",
			},
			CSVTimeSeriesFile: CSVTimeSeriesFile{
				Path:            "backend/ingestion_files/unemployment-by-career-stage.csv",
				DateColumnName:  "Date",
				ValueColumnName: "College graduates",
				DateLayout:      "1/1/2006",
			},
		},
		{
			Series: Series{
				Title:       "Recent Graduates Underemployment Rate",
				Description: "Underemployment rates of recent college graduates",
				Unit:        "Percentage",
				Source:      "U.S. Census Bureau and U.S. Bureau of Labor Statistics, Current Population Survey (IPUMS)",
				SourceURL:   "https://www.newyorkfed.org/research/college-labor-market#--:explore:underemployment",
				Frequency:   "Monthly",
				Notes:       "Rates are seasonally adjusted and smoothed with a three-month moving average. Recent college graduates are those aged 22 to 27 with a bachelor's degree or higher. Underemployment includes those working part-time for economic reasons or in jobs that do not require a college degree. All figures exclude those currently enrolled in school. October 2025 results are estimated due to missing data.",
			},
			CSVTimeSeriesFile: CSVTimeSeriesFile{
				Path:            "backend/ingestion_files/underemployment-by-career-stage.csv",
				DateColumnName:  "Date",
				ValueColumnName: "Recent graduates",
				DateLayout:      "1/1/2006",
			},
		},
		{
			Series: Series{
				Title:       "College Graduates Underemployment Rate",
				Description: "Underemployment rates of all college graduates",
				Unit:        "Percentage",
				Source:      "U.S. Census Bureau and U.S. Bureau of Labor Statistics, Current Population Survey (IPUMS)",
				SourceURL:   "https://www.newyorkfed.org/research/college-labor-market#--:explore:underemployment",
				Frequency:   "Monthly",
				Notes:       "Rates are seasonally adjusted and smoothed with a three-month moving average. College graduates are those aged 22 to 65 with a bachelor's degree or higher. Underemployment includes those working part-time for economic reasons or in jobs that do not require a college degree. All figures exclude those currently enrolled in school. October 2025 results are estimated due to missing data.",
			},
			CSVTimeSeriesFile: CSVTimeSeriesFile{
				Path:            "backend/ingestion_files/underemployment-by-career-stage.csv",
				DateColumnName:  "Date",
				ValueColumnName: "College graduates",
				DateLayout:      "1/1/2006",
			},
		},
		{
			Series: Series{
				Title:       "IT & Help Desk Job Postings Index",
				Description: "Index of online job postings in IT operations and help desk occupations",
				Unit:        "Index (Feb 1, 2020 = 100)",
				Source:      "Indeed Hiring Lab via Federal Reserve Bank of St. Louis (FRED), Series IHLIDXUSTPITOPHE",
				SourceURL:   "https://fred.stlouisfed.org/series/IHLIDXUSTPITOPHE",
				Frequency:   "Daily",
				Notes:       "Indeed calculates the index change in seasonally-adjusted job postings since February 1, 2020, the pre-pandemic baseline. Indeed seasonally adjusts each series based on historical patterns in 2017, 2018, and 2019. Each series, including the national trend, occupational sectors, and sub-national geographies, is seasonally adjusted separately. Indeed switched to this new methodology in December 2022 and now reports all historical data using this new methodology. Historical numbers have been revised and may differ significantly from originally reported values. The new methodology applies a detrended seasonal adjustment factor to the index change in job postings.",
			},
			CSVTimeSeriesFile: CSVTimeSeriesFile{
				Path:            "backend/ingestion_files/it_ops_help_desk_job_listings.csv",
				DateColumnName:  "observation_date",
				ValueColumnName: "IHLIDXUSTPITOPHE",
				DateLayout:      "2006-01-02",
			},
		},
		{
			Series: Series{
				Title:       "Software Developer Job Postings Index",
				Description: "Index of online job postings in software development occupations",
				Unit:        "Index (Feb 1, 2020 = 100)",
				Source:      "Indeed Hiring Lab via Federal Reserve Bank of St. Louis (FRED), Series IHLIDXUSTPSOFTDEVE",
				SourceURL:   "https://fred.stlouisfed.org/series/IHLIDXUSTPSOFTDEVE#",
				Frequency:   "Daily",
				Notes:       "Indeed calculates the index change in seasonally-adjusted job postings since February 1, 2020, the pre-pandemic baseline. Indeed seasonally adjusts each series based on historical patterns in 2017, 2018, and 2019. Each series, including the national trend, occupational sectors, and sub-national geographies, is seasonally adjusted separately. Indeed switched to this new methodology in December 2022 and now reports all historical data using this new methodology. Historical numbers have been revised and may differ significantly from originally reported values. The new methodology applies a detrended seasonal adjustment factor to the index change in job postings.",
			},
			CSVTimeSeriesFile: CSVTimeSeriesFile{
				Path:            "backend/ingestion_files/fred_software_dev_job_listings.csv",
				DateColumnName:  "observation_date",
				ValueColumnName: "IHLIDXUSTPSOFTDEVE",
				DateLayout:      "2006-01-02",
			},
		},
		{
			Series: Series{
				Title:       "Customer Service Job Postings Index",
				Description: "Index of online job postings in customer service occupations",
				Unit:        "Index (Feb 1, 2020 = 100)",
				Source:      "Indeed Hiring Lab via Federal Reserve Bank of St. Louis (FRED), Series IHLIDXUSTPCUSTSERV",
				SourceURL:   "https://fred.stlouisfed.org/series/IHLIDXUSTPCUSTSERV",
				Frequency:   "Daily",
				Notes:       "Indeed calculates the index change in seasonally-adjusted job postings since February 1, 2020, the pre-pandemic baseline. Indeed seasonally adjusts each series based on historical patterns in 2017, 2018, and 2019. Each series, including the national trend, occupational sectors, and sub-national geographies, is seasonally adjusted separately. Indeed switched to this new methodology in December 2022 and now reports all historical data using this new methodology. Historical numbers have been revised and may differ significantly from originally reported values. The new methodology applies a detrended seasonal adjustment factor to the index change in job postings.",
			},
			CSVTimeSeriesFile: CSVTimeSeriesFile{
				Path:            "backend/ingestion_files/fred_cust_service_job_listings.csv",
				DateColumnName:  "observation_date",
				ValueColumnName: "IHLIDXUSTPCUSTSERV",
				DateLayout:      "2006-01-02",
			},
		},
	}

	for _, series := range initialSeries {
		s, file := series.Series, series.CSVTimeSeriesFile
		newSeries, err := CreateSeries(ctx, db, s)
		if err != nil {
			fmt.Printf("Error creating series %s: %v\n\n", series.Title, err)
			continue
		}
		observations, err := ReadObservationsFromCSV(file, newSeries.ID)
		if err != nil {
			fmt.Printf("Error reading observations for series %s: %v\n\n", series.Title, err)
			continue
		}
		fmt.Printf("Number of observations read for series %s: %d\n\n", series.Title, len(observations))
		err = CreateObservations(db, observations)
		if err != nil {
			fmt.Printf("Error creating observations for series %s: %v\n\n", series.Title, err)
			continue
		}
	}
}
