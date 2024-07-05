package router

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"

	h "git.cs.vt.edu/benc114/capstone/handler"
	m "git.cs.vt.edu/benc114/capstone/models"
)

var (
	clients   = make(map[*websocket.Conn]string)
	broadcast = make(chan Message)
	register  = make(chan Client)
	DB        *sql.DB
)

type Client struct {
	Conn   *websocket.Conn
	RoomID string
}

type Message struct {
	Message  string `json:"message"`
	Username string `json:"name"`
	RoomID   string `json:"room_id"`
}

func New() *gin.Engine {
	router := gin.Default()

	// Set up cors middleware
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:5173"}
	config.AllowCredentials = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE"}
	router.Use(cors.New(config))

	store := cookie.NewStore([]byte("secret"))
	router.Use(sessions.Sessions("mysession", store))

	// User endpoints
	router.POST("/signup", h.CreateAccount)
	router.POST("/login", h.Login)
	router.GET("/logout", h.Logout)
	// router.GET("/user", h.GetUser)
	router.DELETE("/user/:id", h.DeleteAccount)

	// Forum endpoints
	router.POST("/forum", h.NewForumPost)
	router.POST("/comment", h.NewForumComment)
	router.GET("/forumpage", h.GetPosts)
	router.GET("/forum/:id", h.GetForumPost)
	router.DELETE("/forum/:id", h.DeletePost)
	router.DELETE("/comment/:id", h.DeleteComment)
	router.GET("/tags", h.GetTags)
	router.POST("/forum/search", h.Search)

	// Friend endpoints
	router.POST("/friendreq", h.SendFriendRequest) // Send a friend request
	// IMPORTANT: The send friend request endpoint can also be used to accept friend requests
	router.GET("/friendreq", h.GetFriendRequests)    // Get friend requests made to user
	router.DELETE("friends", h.RemoveFriend)         // Remove friend
	router.DELETE("/friendreq", h.DenyFriendRequest) // Deny a friend request
	router.GET("/friends", h.GetFriends)             // Get list of friends
	router.GET("/users", h.GetUsers)                 // Get a list of users for the frontend to let people filter and add people as friends

	// Chat endpoints
	router.POST("/chat", h.NewChatRoom)         // Open a new chat room
	router.GET("/chat/:id", h.GetChat)          // Open a specific chat that already exists
	router.GET("/chats", h.GetChats)            // Get chats the user is a part of for the frontend to display
	router.POST("/chat/:id", h.PostChatMessage) // Post a new message to a chat

	router.GET("/ws/:id", WebSocketConnection) // Handle web socket connection for a chat room

	go handleMessages()

	fmt.Println("gin router created")
	return router
}

func handleMessages() {
	for {
		select {
		case client := <-register:
			clients[client.Conn] = client.RoomID
			fmt.Println("Registering")
		case message := <-broadcast:
			for client, roomID := range clients {
				if roomID == message.RoomID {
					err := client.WriteJSON(message)
					if err != nil {
						fmt.Println("ERROR: " + err.Error())
						fmt.Println("Unregistering")
						delete(clients, client)
					}
				}
			}
		}
	}
}

func WebSocketConnection(c *gin.Context) {
	c.Header("Access-Control-Allow-Origin", "http://localhost:5173")
	c.Header("Access-Control-Allow-Credentials", "true")

	roomID := c.Param("id")
	// Make sure that the user is a member of this chat room
	my_id := getUserIdFromSession(c)
	roomUsersQuery := `
	SELECT User1, User2 
	FROM chat_room
	WHERE RoomID = ?`
	rows, err := DB.Query(roomUsersQuery, roomID)
	if err != nil {
		fmt.Println("Error with db query in websocketconnection")
		internalError(c)
		return
	}
	defer rows.Close()
	var user1 string
	var user2 string
	if rows.Next() {
		err = rows.Scan(&user1, &user2)
		if err != nil {
			fmt.Println("Error scanning rows in websocketconnection")
			internalError(c)
			return
		}
	}

	if user1 != my_id && user2 != my_id {
		c.JSON(http.StatusUnauthorized, m.LoginResponse{
			Error: "Unauthorized",
		})
		return
	}

	upgrader := websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		fmt.Println("Error making connection")
		return
	}
	defer conn.Close()

	register <- Client{Conn: conn, RoomID: roomID}

	for {
		var msg Message
		err := conn.ReadJSON(&msg)
		if err != nil {
			fmt.Println("Error reading message: " + err.Error())
			break
		}
		fmt.Println(msg.Message)
		broadcast <- msg
	}
}

func getUserIdFromSession(c *gin.Context) string {
	session := sessions.Default(c)
	userId := session.Get("userId")
	if userId == nil {
		return ""
	} else {
		return userId.(string)
	}
}

func internalError(c *gin.Context) {
	c.JSON(http.StatusInternalServerError, m.LoginResponse{
		Error: "Something went wrong",
	})
}
