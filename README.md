# Things that need to be done to run the frontend:  
1. Install Node.js  
2. `npm i` in the root directory  
3. `npm i react-router-dom `
4. `npm install react-bootstrap bootstrap`
5. `npm i js-cookie`
6. `npm i @uiw/react-md-editor`
7. `npm i --save-dev dotenv`
8. `npm i @chatscope/chat-ui-kit-react`
9. `npm i @chatscope/chat-ui-kit-styles`
10. `npm i react-pdftotext`
11. `npm run dev`

If you are on MacOS:
`npm i @rollup/rollup-darwin-arm64`

# Connecting with Config

To connect, create a config.go file in the root directory that looks like the following.
Make sure that you enter your mysql password in the password field.
The database must be built for this to succeed - see below for how to do that.

```go
package main

type Config struct {
	Username string
	Password string
	Hostname string
	Dbname   string
}

var config = Config{
	Username: "root",
	Password: "YOUR PASSWORD HERE",
	Hostname: "localhost",
	Dbname:   "capstone",
}
```

# Build database

To rebuild the database after changes have been made to it, run the following in the repo's root directory:

1. On the command line, run `mysql -u root -p`
2. Enter `show databases;`
3. `DROP DATABASE capstone;` Your database may be called something else
4. `CREATE DATABASE capstone;`
5. `USE capstone;`
6. `SOURCE capstone_db.sql;`
7. `quit;`

To run queries in this database for testing:
1. On the command line, run `mysql -u root -p`
2. `USE capstone;`
3. Query the database, ie `SELECT * FROM user;`

# Run API

To get the API up and running, type `go run .` in your terminal while in the root directory