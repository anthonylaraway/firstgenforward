package handler

import (
	"database/sql"
	"fmt"
	"net/http"
	"strings"

	"git.cs.vt.edu/benc114/capstone/models"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	uuid "github.com/nu7hatch/gouuid"
	"golang.org/x/crypto/bcrypt"
)

var (
	DB *sql.DB
)

// See router/router.go for how this function gets used
func CreateAccount(c *gin.Context) {
	c.Header("Access-Control-Allow-Origin", "*")
	var newUser models.User

	// Binds the received json to a user object
	err := c.BindJSON(&newUser)
	if err != nil {
		fmt.Println("Error binding json in CreateAccount")
		internalError(c)
		return
	}

	// Check if username or email is in use
	if usernameInUse(newUser.Name) {
		c.JSON(http.StatusConflict, models.LoginResponse{
			Error: "Username is already in use",
		})
	}
	if emailInUse(newUser.Email) {
		c.JSON(http.StatusConflict, models.LoginResponse{
			Error: "Email is already in use",
		})
	}
	// Not on my watch
	if strings.Contains(newUser.Name, "]") || strings.Contains(newUser.Name, "[") ||
		strings.Contains(strings.ToLower(newUser.Name), "quote") {
		c.JSON(http.StatusConflict, models.LoginResponse{
			Error: "Cannot have [quote] in username",
		})
	}

	// Create new uuid as user id
	id, err := uuid.NewV4()
	if err != nil {
		fmt.Println("Error generating new uuid")
		internalError(c)
		return
	}
	newUser.Id = id.String()

	// Hash password before storing
	pass := newUser.Pass
	bytes, err := bcrypt.GenerateFromPassword([]byte(pass), 14)
	if err != nil {
		fmt.Println("Error hashing password in createaccount")
		internalError(c)
		return
	}
	// User object now contains hashed password to be stored
	newUser.Pass = string(bytes)

	// New database transaction
	tx, err := DB.Begin()
	if err != nil {
		fmt.Println("Error starting createaccount transaction")
		internalError(c)
		return
	}

	// Query execution
	// New users will have the user role by default. Admin is manually assigned
	_, err = tx.Exec("INSERT INTO user (Name, Email, UserType, UserID, Password) VALUES (?, ?, ?, ?, ?)", newUser.Name, newUser.Email, "User", newUser.Id, newUser.Pass)
	if err != nil {
		tx.Rollback()
		fmt.Println("Error with createaccount query")
		internalError(c)
		return
	}

	// Commit transaction!
	err = tx.Commit()
	if err != nil {
		fmt.Println("Error committing trancation")
		internalError(c)
	}

	c.JSON(http.StatusOK, models.LoginResponse{
		Message: "Account successfully created",
	})
}

func Login(c *gin.Context) {
	c.Header("Access-Control-Allow-Origin", "http://localhost:5173")
	c.Header("Access-Control-Allow-Credentials", "true")
	var loginRequest models.LoginRequest

	// Will create a user object with just username and password
	err := c.BindJSON(&loginRequest)
	if err != nil {
		fmt.Println("Error binding json in Login func")
		internalError(c)
		return
	}

	// Query database just to get the hashed password
	results, err := DB.Query("SELECT Name, Email, UserType, UserID, Password FROM user WHERE Email = ?", loginRequest.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, models.LoginResponse{
				Error: "Could not find user with given email",
			})
			return
		}
		fmt.Println("Error querying db in Login func")
		internalError(c)
		return
	}

	defer results.Close()

	// Scan in hashed password from db
	var user models.User
	if results.Next() {
		err = results.Scan(&user.Name, &user.Email, &user.Role, &user.Id, &user.Pass)
		if err != nil {
			fmt.Println("Error scanning in user")
			internalError(c)
			return
		}
	} else {
		c.JSON(http.StatusNotFound, models.LoginResponse{
			Error: "Could not find user with given email",
		})
		return
	}

	// Check if password is correct
	err = bcrypt.CompareHashAndPassword([]byte(user.Pass), []byte(loginRequest.Pass))
	// Incorrect password
	if err != nil {
		c.JSON(http.StatusUnauthorized, models.LoginResponse{
			Error: "Incorrect password",
		})
	}

	// Set the user session to create a cookie on the client side
	session := sessions.Default(c)
	session.Set("userId", user.Id)
	session.Save()

	// And send a success message back to the frontend!
	c.JSON(http.StatusOK, models.SuccessfulLogin{
		Message:  "Logged in successfully",
		Username: user.Name,
		UserID:   user.Id,
	})
}

// Clear session when logout endpoint is called
func Logout(c *gin.Context) {
	c.Header("Access-Control-Allow-Origin", "*")
	session := sessions.Default(c)
	session.Clear()
	session.Save()

	c.JSON(http.StatusOK, models.LoginResponse{
		Message: "Logged out",
	})
}

func DeleteAccount(c *gin.Context) {
	c.Header("Access-Control-Allow-Origin", "http://localhost:5173")
	c.Header("Access-Control-Allow-Credentials", "true")

	id := c.Param("id")
	// helper function from handler/forum.go
	user_id := getUserIdFromSession(c)

	if user_id != id {
		// Print is just for potential debugging, there is no internal error here
		fmt.Println("User attempted to delete unauthorized account")
		c.JSON(http.StatusUnauthorized, models.LoginResponse{
			Error: "Unauthorized",
		})
		return
	}

	// ALL we are doing at the moment is setting their username to [deleted]
	// If we were developing a real platform, we would want to do much more, but for the time being
	// we are avoiding the extra complexity in the interest of implementing everything that we aim to
	// and having more to show for our time investment.
	_, err := DB.Query(`
	UPDATE user
	SET Name = '[deleted]'
	WHERE UserID = ?`, id)
	if err != nil {
		fmt.Println("Error deleting user")
		c.JSON(http.StatusInternalServerError, models.LoginResponse{
			Error: "Internal error",
		})
	} else {
		c.JSON(http.StatusOK, models.LoginResponse{
			Message: "User successfully deleted",
		})
	}
}

// Helper function for when we have any internal error
func internalError(c *gin.Context) {
	c.JSON(http.StatusInternalServerError, models.LoginResponse{
		Error: "Something went wrong",
	})
}

// Helper function to determine if username exists in db
func usernameInUse(username string) bool {
	var count int
	DB.QueryRow("SELECT COUNT(*) FROM user WHERE Name = ?", username).Scan(&count)
	return count > 0
}

// Helper function to determine if email exists in db
func emailInUse(email string) bool {
	var count int
	DB.QueryRow("SELECT COUNT(*) FROM user WHERE Email = ?", email).Scan(&count)
	return count > 0
}
