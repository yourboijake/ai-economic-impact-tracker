package main

import (
	"context"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"github.com/yourboijake/ai-economic-impact-tracker/backend/src/models"
)

type User struct {
	gorm.Model
	FirstName string
	LastName  string
	Email     string `gorm:"unique"`
}

func insertUsers(ctx context.Context, db *gorm.DB) error {
	newUser1 := User{FirstName: "John", LastName: "Doe", Email: "john.doe@gmail.com"}
	err := gorm.G[User](db).Create(ctx, &newUser1)
	if err != nil {
		return err
	}
	newUser2 := User{FirstName: "Jane", LastName: "Smith", Email: "jane.doe@gmail.com"}
	err = gorm.G[User](db).Create(ctx, &newUser2)
	if err != nil {
		return err
	}
	return nil
}

func main() {
	// db, err := gorm.Open(sqlite.Open("test.db"), &gorm.Config{})
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	ctx := context.Background()

	db.AutoMigrate(&User{})

	// insert users
	err = insertUsers(ctx, db)
	if err != nil {
		panic("failed to insert users")
	}

	users, err := gorm.G[User](db).Find(ctx)
	if err != nil {
		panic("failed to query users")
	}

	for _, user := range users {
		println(user.FirstName, user.LastName, user.Email)
	}
	println("hello there, testing print with more text")

	r := gin.Default()

	r.GET("/api/hello", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Hello from Gin!"})
	})

	m := models.Series{
		Title:       "Test Series",
		Description: "This is a test series for demonstration purposes.",
	}

	r.GET("/api/test", func(c *gin.Context) {
		c.JSON(200, m)
	})

	r.GET("/api/users", func(c *gin.Context) {
		c.JSON(200, users)
	})

	r.Run(":3000")
}
