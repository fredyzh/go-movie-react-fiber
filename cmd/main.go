package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
)

func main() {
	// Creates a new Fiber instance.
	app := fiber.New()

	app.Static("/", "./build")

	app.Static("*", "./build/index.html")

	port := os.Getenv("WEB_PORT")

	if port == "" {
		port = "8282"
	}

	// Listen to port 8080.
	log.Fatal(app.Listen(":" + port))
}
