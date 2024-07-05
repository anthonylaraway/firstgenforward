package main

type Config struct {
	Username string
	Password string
	Hostname string
	Dbname   string
}

var config = Config{
	Username: "root",
	Password: "HuntressLullaby5*",
	Hostname: "localhost",
	Dbname:   "capstone",
}
