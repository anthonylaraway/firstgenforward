package main

import (
	"database/sql"
	"fmt"

	"git.cs.vt.edu/benc114/capstone/handler"
	"git.cs.vt.edu/benc114/capstone/router"
	_ "github.com/go-sql-driver/mysql"
)

func main() {
	// Format data source name string for db connection
	dsn := fmt.Sprintf("%s:%s@tcp(%s)/%s?parseTime=true", config.Username, config.Password, config.Hostname, config.Dbname)
	// Connect to mysql db with dsn
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		fmt.Println("Error opening db: " + err.Error())
	} else {
		fmt.Println("Db connection successful!")
	}

	// Set global db variable for handler package for querying
	handler.DB = db

	router.DB = db
	r := router.New()
	// Run the gin router on local host w/ port 8080
	r.Run("localhost:8080")
}
