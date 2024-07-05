package handler

import (
	"database/sql"
	"fmt"
	"net/http"
	"sort"

	m "git.cs.vt.edu/benc114/capstone/models"
	"github.com/gin-gonic/gin"
	uuid "github.com/nu7hatch/gouuid"
)

/*
Endpoints to implement:

router.POST("/chat", h.NewChatRoom) // Open a new chat room
router.GET("/chat", h.GetChat)      // Open a specific chat that already exists
router.GET("/chats", h.GetChats)    // Get chats the user is a part of for the frontend to display
router.POST("/chat/:id", h.PostChatMessage) // Post a new message to a chat
*/

func PostChatMessage(c *gin.Context) {
	c.Header("Access-Control-Allow-Origin", "http://localhost:5173")
	c.Header("Access-Control-Allow-Credentials", "true")

	id := c.Param("id")
	var body m.NewChatMessageBody
	c.BindJSON(&body)
	message := body.Message

	newUuid, _ := uuid.NewV4()
	uuidString := newUuid.String()

	my_id := getUserIdFromSession(c)

	newMessageQuery := `
	INSERT INTO chat_message (MessageID, RoomID, UserID, Message)
	VALUES (?, ?, ?, ?)
	`

	_, err := DB.Exec(newMessageQuery, uuidString, id, my_id, message)
	if err != nil {
		if err != sql.ErrNoRows {
			fmt.Println("Error with new message query in postchatmessage: " + err.Error())
			internalError(c)
			return
		}
	}

	c.JSON(http.StatusCreated, m.LoginResponse{
		Message: "Message created",
	})
}

func GetChats(c *gin.Context) {
	c.Header("Access-Control-Allow-Origin", "http://localhost:5173")
	c.Header("Access-Control-Allow-Credentials", "true")

	my_id := getUserIdFromSession(c)

	var chats []m.Chat
	var response m.GetChatsResponse

	getChatsQuery1 := `
	SELECT User1, RoomID, LastUpdated
	FROM chat_room
	WHERE User2 = ?
	`
	rows1, err := DB.Query(getChatsQuery1, my_id)
	if err != nil {
		if err != sql.ErrNoRows {
			fmt.Println("Query1 error getchats")
			internalError(c)
			return
		}
	}
	defer rows1.Close()

	for rows1.Next() {
		var chat m.Chat
		var friend_id string
		err = rows1.Scan(&friend_id, &chat.RoomID, &chat.LastUpdated)
		if err != nil {
			fmt.Println("Error scanning getchats query 1")
			internalError(c)
			return
		}
		chat.FriendName = getNameFromID(friend_id)
		chats = append(chats, chat)
	}

	getChatsQuery2 := `
	SELECT User2, RoomID, LastUpdated
	FROM chat_room
	WHERE User1 = ?
	`

	rows2, err := DB.Query(getChatsQuery2, my_id)
	if err != nil {
		if err != sql.ErrNoRows {
			fmt.Println("Query1 error getchats")
			internalError(c)
			return
		}
	}
	defer rows2.Close()
	for rows2.Next() {
		var chat m.Chat
		var friend_id string
		err = rows2.Scan(&friend_id, &chat.RoomID, &chat.LastUpdated)
		if err != nil {
			fmt.Println("Error scanning getchats query 2")
			fmt.Println(err.Error())
			internalError(c)
			return
		}
		chat.FriendName = getNameFromID(friend_id)
		chats = append(chats, chat)
	}

	sort.Slice(chats, func(i, j int) bool {
		return chats[i].LastUpdated.After(chats[j].LastUpdated)
	})

	response.Chats = chats

	c.JSON(http.StatusOK, response)
}

func GetChat(c *gin.Context) {
	c.Header("Access-Control-Allow-Origin", "http://localhost:5173")
	c.Header("Access-Control-Allow-Credentials", "true")

	id := c.Param("id")
	me := getUserIdFromSession(c)
	var response m.ChatRoomResponse

	roomQuery := `
	SELECT User1, User2 
	FROM chat_room
	WHERE RoomID = ?
	`

	roomRows, err := DB.Query(roomQuery, id)
	if err != nil {
		fmt.Println("Error with get room query")
		internalError(c)
		return
	}

	defer roomRows.Close()
	var user1, user2 string
	if roomRows.Next() {
		err = roomRows.Scan(&user1, &user2)
		if err != nil {
			fmt.Println("Error scanning rows in getchat")
			internalError(c)
			return
		}
	}

	var friend string
	if me == user1 {
		friend = user2
	} else {
		friend = user1
	}

	my_name := getNameFromID(me)
	friend_name := getNameFromID(friend)

	response.RoomID = id
	response.Me = my_name
	response.Friend = friend_name

	messagesQuery := `
	SELECT UserID, Message, CreatedAt
	FROM chat_message
	WHERE RoomID = ?
	`

	messageRows, err := DB.Query(messagesQuery, id)
	if err != nil {
		fmt.Println("error with messages query in getchat")
		internalError(c)
		return
	}
	defer messageRows.Close()

	var messages []m.Message
	for messageRows.Next() {
		var message m.Message
		var sender string
		err = messageRows.Scan(&sender, &message.Message, &message.CreatedAt)
		if err != nil {
			fmt.Println("Error scanning in message")
			internalError(c)
			return
		}
		if sender == me {
			message.Sender = my_name
		} else {
			message.Sender = friend_name
		}
		messages = append(messages, message)
	}

	sort.Slice(messages, func(i, j int) bool {
		return messages[i].CreatedAt.Before(messages[j].CreatedAt)
	})

	response.Messages = messages

	c.JSON(http.StatusOK, response)
}

/*
Expected post body:

	{
		"id":"id of the user to open a chat with"
	}
*/
func NewChatRoom(c *gin.Context) {
	c.Header("Access-Control-Allow-Origin", "http://localhost:5173")
	c.Header("Access-Control-Allow-Credentials", "true")

	var body m.NewFriendRequestRequestBody
	c.BindJSON(&body)
	friend_id := body.ID
	// getUserIdFromSession is a helper function in forum.go
	my_id := getUserIdFromSession(c)

	// Logic to avoid creating a new room if one already exists between the two users
	findRoomQuery := `
    SELECT RoomID
    FROM chat_room
    WHERE User1 = ? 
	AND User2 = ?
    `

	rows1, err := DB.Query(findRoomQuery, my_id, friend_id)
	if err != nil {
		fmt.Println("Error with findroom query 1")
		internalError(c)
		return
	}
	defer rows1.Close()
	if rows1.Next() {
		var room_id string
		err = rows1.Scan(&room_id)
		if err != nil {
			fmt.Println("Error scanning rows1")
			internalError(c)
			return
		}
		c.JSON(http.StatusCreated, m.LoginResponse{
			Message: room_id,
		})
		return
	}

	rows2, err := DB.Query(findRoomQuery, friend_id, my_id)
	if err != nil {
		fmt.Println("Error with findroom query 2")
		internalError(c)
		return
	}
	defer rows2.Close()
	if rows2.Next() {
		var room_id string
		err = rows2.Scan(&room_id)
		if err != nil {
			fmt.Println("Error scanning rows2")
			internalError(c)
			return
		}
		c.JSON(http.StatusCreated, m.LoginResponse{
			Message: room_id,
		})
		return
	}

	newUuid, _ := uuid.NewV4()
	uuidString := newUuid.String()

	newRoomQuery := `
	INSERT INTO chat_room (RoomID, User1, User2)
	VALUES (?, ?, ?)
	`

	_, err = DB.Exec(newRoomQuery, uuidString, my_id, friend_id)
	if err != nil {
		if err != sql.ErrNoRows {
			fmt.Println("Error with new chat room query")
			internalError(c)
			return
		}
	}

	c.JSON(http.StatusCreated, m.LoginResponse{
		Message: uuidString,
	})
}
