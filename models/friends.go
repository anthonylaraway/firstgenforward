package models

type NewFriendRequestRequestBody struct {
	ID string `json:"id"`
}

type GetUsersResponse struct {
	Users []GetUsersUser `json:"users"`
}

type GetUsersUser struct {
	Name string `json:"name"`
	ID   string `json:"id"`
}
