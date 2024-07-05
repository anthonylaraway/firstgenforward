package models

import "time"

type ChatRoomResponse struct {
	Me       string    `json:"me"`
	Friend   string    `json:"friend"`
	RoomID   string    `json:"room_id"`
	Messages []Message `json:"messages"`
}

type Message struct {
	Sender    string    `json:"sender"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"created_at"`
}

type NewChatMessageBody struct {
	Message string `json:"message"`
}

type GetChatsResponse struct {
	Chats []Chat `json:"chats"`
}

type Chat struct {
	RoomID      string    `json:"id"`
	FriendName  string    `json:"friend"`
	LastUpdated time.Time `json:"last_updated"`
}
