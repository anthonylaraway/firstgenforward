# FirstGenForward SWE Capstone Project Backend
The backend that I wrote 100% of for a school project.

The backend is written with go, and the database is built locally using mysql with the .sql file. A package called gin is used to simplify http handling. Business logic for endpoints can be found in the handler folder!

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