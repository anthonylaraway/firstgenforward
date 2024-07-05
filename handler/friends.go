package handler

import (
	"database/sql"
	"fmt"
	"net/http"

	m "git.cs.vt.edu/benc114/capstone/models"
	"github.com/gin-gonic/gin"
	uuid "github.com/nu7hatch/gouuid"
)

// Expected body: id field with the id of the person whose friend request you're going to deny
func DenyFriendRequest(c *gin.Context) {
	c.Header("Access-Control-Allow-Origin", "http://localhost:5173")
	c.Header("Access-Control-Allow-Credentials", "true")

	my_id := getUserIdFromSession(c)

	var body m.NewFriendRequestRequestBody
	c.BindJSON(&body)
	sender_id := body.ID

	denyFriendRequestQuery := `
	DELETE FROM friend_request
	WHERE FromUser = ?
	AND ToUser = ?`

	_, err := DB.Exec(denyFriendRequestQuery, sender_id, my_id)
	if err != nil {
		if err != sql.ErrNoRows {
			fmt.Println("Error with deny friend request query")
			internalError(c)
			return
		}
	}

	c.JSON(http.StatusNoContent, m.LoginResponse{
		Message: "Successfully deleted friend request",
	})
}

func GetFriends(c *gin.Context) {
	c.Header("Access-Control-Allow-Origin", "http://localhost:5173")
	c.Header("Access-Control-Allow-Credentials", "true")

	my_id := getUserIdFromSession(c)

	getFriendQuery1 := `
	SELECT User2
	FROM friend
	WHERE User1 = ?`

	var friendIDs []string

	rows, err := DB.Query(getFriendQuery1, my_id)
	if err != nil {
		if err != sql.ErrNoRows {
			fmt.Println("Error with query 1 in getfriends")
			internalError(c)
			return
		}
	}
	defer rows.Close()
	for rows.Next() {
		var id string
		err = rows.Scan(&id)
		if err != nil {
			fmt.Println("Error scanning w/ query 1 in getfriends")
			internalError(c)
			return
		}
		friendIDs = append(friendIDs, id)
	}

	getFriendQuery2 := `
	SELECT User1
	FROM friend
	WHERE User2 = ?`

	rows, err = DB.Query(getFriendQuery2, my_id)
	if err != nil {
		if err != sql.ErrNoRows {
			fmt.Println("Error with query 2 in getfriends")
			internalError(c)
			return
		}
	}
	defer rows.Close()
	for rows.Next() {
		var id string
		err = rows.Scan(&id)
		if err != nil {
			fmt.Println("Error scanning w/ query 2 in getfriends")
			internalError(c)
			return
		}
		friendIDs = append(friendIDs, id)
	}

	// Now we have a list of all the IDs of the user's friends
	// We can reuse the GetUsers response struct for this endpoint
	var response m.GetUsersResponse

	for _, userID := range friendIDs {
		var user m.GetUsersUser
		name := getNameFromID(userID)
		if name == "" {
			fmt.Println("Name not found with user id in getfriends")
			internalError(c)
			return
		}
		user.Name = name
		user.ID = userID
		response.Users = append(response.Users, user)
	}

	c.JSON(http.StatusOK, response)
}

func GetFriendRequests(c *gin.Context) {
	c.Header("Access-Control-Allow-Origin", "http://localhost:5173")
	c.Header("Access-Control-Allow-Credentials", "true")

	getFriendRequestsQuery := `
	SELECT FromUser 
	FROM friend_request
	WHERE ToUser = ?
	`

	rows, err := DB.Query(getFriendRequestsQuery, getUserIdFromSession(c))
	if err != nil {
		fmt.Println("Error with getfriendrequests query")
		internalError(c)
		return
	}
	defer rows.Close()
	var userIDs []string
	for rows.Next() {
		var userID string
		err = rows.Scan(&userID)
		if err != nil {
			fmt.Println("Error scanning in user ID in getfriendrequests")
			internalError(c)
			return
		}
		userIDs = append(userIDs, userID)
	}

	var response m.GetUsersResponse
	// We can reuse the GetUsers structs for this endpoint!
	for _, userID := range userIDs {
		var user m.GetUsersUser
		name := getNameFromID(userID)
		if name == "" {
			fmt.Println("Name not found with user id in getfriendrequests")
			internalError(c)
			return
		}
		user.Name = name
		user.ID = userID
		response.Users = append(response.Users, user)
	}

	c.JSON(http.StatusOK, response)
}

// Function to get ALL users (ID and name)
// This is for use by the frontend to let people find people to open chats with.
func GetUsers(c *gin.Context) {
	c.Header("Access-Control-Allow-Origin", "http://localhost:5173")
	c.Header("Access-Control-Allow-Credentials", "true")
	getUsersQuery := `
	SELECT UserID, Name
	FROM user
	`
	my_id := getUserIdFromSession(c)

	rows, err := DB.Query(getUsersQuery)
	if err != nil {
		fmt.Println("Error with get users query")
		internalError(c)
		return
	}
	defer rows.Close()
	var getUsersResponse m.GetUsersResponse
	for rows.Next() {
		var newUser m.GetUsersUser
		err = rows.Scan(&newUser.ID, &newUser.Name)
		if err != nil {
			fmt.Println("Error scanning in users in getusers")
			internalError(c)
			return
		}
		if newUser.ID != my_id {
			getUsersResponse.Users = append(getUsersResponse.Users, newUser)
		}
	}
	c.JSON(http.StatusOK, getUsersResponse)
}

// Expected body: ID of the friend to remove.
func RemoveFriend(c *gin.Context) {
	c.Header("Access-Control-Allow-Origin", "http://localhost:5173")
	c.Header("Access-Control-Allow-Credentials", "true")
	var body m.NewFriendRequestRequestBody
	c.BindJSON(&body)
	friend_id := body.ID
	// getUserIdFromSession is a helper function in forum.go
	my_id := getUserIdFromSession(c)

	if !usersAreFriends(my_id, friend_id) {
		c.JSON(http.StatusBadRequest, m.LoginResponse{
			Error: "Users are not friends",
		})
		return
	}

	removeFriendQuery := `
		DELETE FROM friend
		WHERE User1 = ?
		AND User2 = ?
	`

	_, err := DB.Exec(removeFriendQuery, my_id, friend_id)
	if err != nil {
		if err != sql.ErrNoRows {
			fmt.Println("Error with remove friend query 1")
			internalError(c)
			return
		}
	}
	_, err = DB.Exec(removeFriendQuery, friend_id, my_id)
	if err != nil {
		if err != sql.ErrNoRows {
			fmt.Println("Error with remove friend query 2")
			internalError(c)
			return
		}
	}
	c.JSON(http.StatusNoContent, m.LoginResponse{
		Message: "Friend successfully removed",
	})
}

// Expected body: ID of the person you send a friend request to.
func SendFriendRequest(c *gin.Context) {
	c.Header("Access-Control-Allow-Origin", "http://localhost:5173")
	c.Header("Access-Control-Allow-Credentials", "true")
	var body m.NewFriendRequestRequestBody
	c.BindJSON(&body)
	friend_id := body.ID
	// getUserIdFromSession is a helper function in forum.go
	my_id := getUserIdFromSession(c)

	// If user already has outstanding friend request to target user, we do nothing
	if friendRequestAlreadyExists(my_id, friend_id) {
		c.JSON(http.StatusConflict, m.LoginResponse{
			Error: "Friend request already exists",
		})
		return
	}

	// If the two users are already friends, we do
	if usersAreFriends(my_id, friend_id) {
		c.JSON(http.StatusConflict, m.LoginResponse{
			Error: "Users are already friends",
		})
		return
	}

	uuid, _ := uuid.NewV4()
	uuidString := uuid.String()

	// If the person they are sending a friend request to has a friend request already sent to the user,
	// then they become friends
	if friendRequestAlreadyExists(friend_id, my_id) {
		tx, err := DB.Begin()
		if err != nil {
			fmt.Println("Error beginning transaction")
			internalError(c)
			return
		}

		// Make them friends
		newFriendQuery := `
		INSERT INTO friend (FriendID, User1, User2) VALUES (?, ?, ?)
		`
		_, err = tx.Exec(newFriendQuery, uuidString, my_id, friend_id)
		if err != nil {
			fmt.Println("Error creating new friends in sendfriendrequest")
			fmt.Println(err.Error())
			internalError(c)
			return
		}

		// Delete the friend request from the target user

		deleteFriendRequestQuery := `
		DELETE FROM friend_request 
		WHERE FromUser = ?
		AND ToUser = ?
		`
		_, err = tx.Exec(deleteFriendRequestQuery, friend_id, my_id)
		if err != nil {
			fmt.Println("Error deleting outstanding friend request")
			internalError(c)
			tx.Rollback()
			return
		}

		tx.Commit()
		c.JSON(http.StatusOK, m.LoginResponse{
			Message: "Added user as friend",
		})
		return
	}

	// Otherwise, we make the friend request
	makeRequestQuery := `
	INSERT INTO friend_request (RequestID, FromUser, ToUser) VALUES (?, ?, ?)
	`

	_, err := DB.Exec(makeRequestQuery, uuidString, my_id, friend_id)
	if err != nil {
		fmt.Println("Error making new friend request")
		internalError(c)
		return
	}

	c.JSON(http.StatusOK, m.LoginResponse{
		Message: "Friend request made successfully",
	})
}

func usersAreFriends(my_id, friend_id string) bool {
	query := `
	SELECT * FROM friend
	WHERE User1 = ?
	AND User2 = ?
	`

	rows, err := DB.Query(query, my_id, friend_id)
	if err != nil {
		fmt.Println("Error with usersAreFriends query 1")
		return true
	}
	if rows.Next() {
		rows.Close()
		return true
	}
	rows.Close()
	rows, err = DB.Query(query, friend_id, my_id)
	if err != nil {
		fmt.Println("Error with usersAreFriends query 2")
		return true
	}
	defer rows.Close()
	return rows.Next()
}

func friendRequestAlreadyExists(from, to string) bool {
	query := `
	SELECT * FROM friend_request 
	WHERE FromUser = ? 
	AND ToUser = ?
	`

	rows, err := DB.Query(query, from, to)
	if err != nil {
		fmt.Println("Error with friendRequestAlreadyExists query")
		return true
	}
	defer rows.Close()
	return rows.Next()
}

// Helper function to get a user's username given their ID
func getNameFromID(id string) string {
	getNameQuery := `
	SELECT Name
	FROM user
	WHERE UserID = ?
	`

	rows, err := DB.Query(getNameQuery, id)
	if err != nil {
		return ""
	}
	defer rows.Close()
	var name string
	if rows.Next() {
		err = rows.Scan(&name)
		if err != nil {
			return ""
		}
		return name
	} else {
		return ""
	}
}
