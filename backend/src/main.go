package main

import (
	"github.com/gin-gonic/gin"
	"github.com/yourboijake/ai-economic-impact-tracker/backend/src/models"
	"gorm.io/gorm"
)

func main() {
	db, ctx, err := models.InitDB()
	if err != nil {
		panic("Failed to connect to database!")
	}

	m := models.Series{
		Title:       "Test Series",
		Description: "This is a test series for demonstration purposes.",
		Unit:        "Millions",
		Source:      "Test Source",
		Frequency:   "Monthly",
		Notes:       "No additional notes.",
	}

	gorm.G[models.Series](db).Create(*ctx, &m)
	retrieved, err := gorm.G[models.Series](db).Find(*ctx)
	if err != nil {
		panic("Failed to retrieve series!")
	}

	r := gin.Default()
	r.GET("/api/test", func(c *gin.Context) {
		c.JSON(200, retrieved)
	})

	r.Run(":3000")
}
