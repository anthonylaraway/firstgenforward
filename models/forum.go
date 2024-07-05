package models

import "time"

type NewComment struct {
	PostId string `json:"post_id"` // The ID of the post the comment is on
	Text   string `json:"text"`
}

type NewForumPost struct {
	Text  string   `json:"text"`
	Title string   `json:"title"`
	Tags  []string `json:"tags"`
}

// Getting post info for forum homepage (list of all posts)
type PostsResponse struct {
	Error string `json:"error"`
	Posts []Post `json:"posts"`
}

type Post struct {
	PostID      string    `json:"post_id"`
	Title       string    `json:"title"`
	Author      string    `json:"author"`
	LastUpdated time.Time `json:"last_updated"`
	Tags        []Tag     `json:"tags"`
}

type Tag struct {
	Tag   string `json:"tag"`
	Color string `json:"color"`
}

// Getting one post
type PostResponse struct {
	Error     string    `json:"error"`
	PostID    string    `json:"post_id"`
	Title     string    `json:"title"`
	Author    string    `json:"author"`
	UserID    string    `json:"user_id"`
	CreatedAt time.Time `json:"created_at"`
	Text      string    `json:"text"`
	Comments  []Comment `json:"comments"`
	Tags      []Tag     `json:"tags"`
}

type Comment struct {
	Id        string    `json:"id"`
	Text      string    `json:"text"`
	Author    string    `json:"author"`
	UserID    string    `json:"user_id"`
	CreatedAt time.Time `json:"created_at"`
}

type TagResponse struct {
	Error string `json:"error"`
	Tags  []Tag  `json:"tags"`
}

type SearchRequest struct {
	// Keyword can also be a phrase - basically whatever is inputted in the search box
	Keyword string `json:"keyword"`
}

type SearchPost struct {
	PostID      string    `json:"post_id"`
	Title       string    `json:"title"`
	Text        string    `json:"text"`
	Author      string    `json:"author"`
	LastUpdated time.Time `json:"last_updated"`
	Tags        []Tag     `json:"tags"`
}
