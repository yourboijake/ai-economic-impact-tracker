package main

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/yourboijake/ai-economic-impact-tracker/backend/src/models"
)

func main() {
	db, _, err := models.InitDB()
	if err != nil {
		panic("Failed to connect to database!")
	}

	retrieved, err := models.GetSeriesWithObservationsBySeriesID(db, 1)
	if err != nil {
		panic("Failed to retrieve series with observations!")
	}

	fmt.Println("obs count:", len(retrieved.Observations))

	r := gin.Default()
	r.GET("/api/data", func(c *gin.Context) {
		c.JSON(200, retrieved)
	})

	r.Run(":3000")
}
