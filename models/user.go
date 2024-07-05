package models

// We can use json tags to make it easy to encode/decode between json objects and go structs
type User struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	Role  string `json:"role"` // User or Admin
	Id    string `json:"id"`   // UUID
	Pass  string `json:"pass"` // Hashed password
}

type LoginRequest struct {
	Email string `json:"email"`
	Pass  string `json:"pass"`
}

type LoginResponse struct {
	Message string `json:"message"`
	Error   string `json:"error"`
}

type SuccessfulLogin struct {
	Message  string `json:"message"`
	Username string `json:"username"`
	UserID   string `json:"id"`
}
