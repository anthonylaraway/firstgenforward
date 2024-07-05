package handler

import (
	"fmt"
	"math/rand"
	"net/http"
	"regexp"
	"strings"

	m "git.cs.vt.edu/benc114/capstone/models"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	uuid "github.com/nu7hatch/gouuid"
)

// Create a new post on the forums
// Inserts new post into the db, as well as tag entries for each tag
func NewForumPost(c *gin.Context) {
	c.Header("Access-Control-Allow-Origin", "http://localhost:5173")
	c.Header("Access-Control-Allow-Credentials", "true")
	var newForumPost m.NewForumPost

	// Binds the received json to a new forum post object
	err := c.BindJSON(&newForumPost)
	if err != nil {
		fmt.Println("Error binding json in NewForumPost")
		// internalError function given in handler/user.go
		internalError(c)
		return
	}

	// Get user id
	userId := getUserIdFromSession(c)
	if userId == "" {
		c.JSON(http.StatusUnauthorized, m.LoginResponse{
			Error: "Not authenticated",
		})
		return
	}

	// Create new uuid as post id
	id, err := uuid.NewV4()
	if err != nil {
		fmt.Println("Error generating new uuid")
		internalError(c)
		return
	}
	postId := id.String()

	// New database transaction
	tx, err := DB.Begin()
	if err != nil {
		fmt.Println("Error starting createaccount transaction")
		internalError(c)
		return
	}

	// Insert the post
	_, err = tx.Exec("INSERT INTO post (PostID, Title, Text, UserID) VALUES (?, ?, ?, ?)", postId, newForumPost.Title, newForumPost.Text, userId)
	if err != nil {
		tx.Rollback()
		fmt.Println("Error with newforumpost query")
		internalError(c)
		return
	}

	// Insert the tags
	var tagId string
	for _, tag := range newForumPost.Tags {
		id, err := uuid.NewV4()
		if err != nil {
			fmt.Println("Error generating new uuid")
			internalError(c)
			return
		}
		tagId = id.String()

		_, err = tx.Exec("INSERT INTO tag (TagID, PostID, Tag) VALUES (?, ?, ?)", tagId, postId, tag)
		if err != nil {
			tx.Rollback()
			fmt.Println("Error with new tag query")
			internalError(c)
			return
		}
	}

	// Commit transaction!
	err = tx.Commit()
	if err != nil {
		fmt.Println("Error committing trancation")
		internalError(c)
	}

	for _, tag := range newForumPost.Tags {
		colorQuery := `
		SELECT c.Color
		FROM color c
		JOIN tag t ON t.Tag = c.Tag
		WHERE t.Tag = ?
		`
		colorRows, err := DB.Query(colorQuery, tag)
		if err != nil {
			tx.Rollback()
			fmt.Println("Error with select color query in new post func")
			internalError(c)
			return
		}
		defer colorRows.Close()
		// If tag doesn't have an entry yet
		if !(colorRows.Next()) {
			insertColorQuery := `
			INSERT INTO color (Tag, Color)
			VALUES(?, ?)
			`
			_, err = DB.Exec(insertColorQuery, tag, randomColor())
			if err != nil {
				tx.Rollback()
				fmt.Println("Error with insert color query in new post func")
				internalError(c)
				return
			}
		}
	}

	// We can use the LoginResponse model since it's a generic message/error json response
	c.JSON(http.StatusOK, m.LoginResponse{
		Message: "Post successfully created",
	})
}

// Handler function to post a new comment to a forum post
func NewForumComment(c *gin.Context) {
	c.Header("Access-Control-Allow-Origin", "http://localhost:5173")
	c.Header("Access-Control-Allow-Credentials", "true")
	var newComment m.NewComment

	// Binds the received json to a new comment object
	err := c.BindJSON(&newComment)
	if err != nil {
		fmt.Println("Error binding json in NewForumComment")
		// internalError function given in handler/user.go
		internalError(c)
		return
	}

	newComment.Text = removeNestedQuotes(newComment.Text)

	// Create new uuid as comment id
	id, err := uuid.NewV4()
	if err != nil {
		fmt.Println("Error generating new uuid")
		internalError(c)
		return
	}
	commentId := id.String()

	// New database transaction
	tx, err := DB.Begin()
	if err != nil {
		fmt.Println("Error starting createaccount transaction")
		internalError(c)
		return
	}

	// Get user id
	userId := getUserIdFromSession(c)
	if userId == "" {
		c.JSON(http.StatusUnauthorized, m.LoginResponse{
			Error: "Not authenticated",
		})
		return
	}

	// Query execution
	_, err = tx.Exec("INSERT INTO comment (CommentID, Text, PostID, UserID) VALUES (?, ?, ?, ?)", commentId, newComment.Text, newComment.PostId, userId)
	if err != nil {
		tx.Rollback()
		fmt.Println("Error with newforumcomment query")
		internalError(c)
		return
	}

	// Commit transaction!
	err = tx.Commit()
	if err != nil {
		fmt.Println("Error committing trancation")
		internalError(c)
	}

	// We can use the LoginResponse model since it's a generic message/error json response
	c.JSON(http.StatusOK, m.LoginResponse{
		Message: "Comment successfully posted",
	})
}

// GetPosts function gets a list of all the forum posts for display on the forum home page
func GetPosts(c *gin.Context) {
	c.Header("Access-Control-Allow-Origin", "*")
	query := `
	SELECT
		p.PostID,
		p.Title,
		u.Name AS Author,
		p.LastUpdated,
		GROUP_CONCAT(t.Tag) AS tags
	FROM
		post p
	INNER JOIN
		user u ON p.UserID = u.UserID
	LEFT JOIN
		tag t ON p.PostID = t.PostID
	GROUP BY
		p.PostID, p.Title, u.Name, p.LastUpdated
	ORDER BY
		p.LastUpdated DESC
	`

	rows, err := DB.Query(query)
	if err != nil {
		fmt.Println("Error with get posts query")
		c.JSON(http.StatusInternalServerError, m.PostsResponse{
			Error: "Internal error",
		})
		return
	}
	defer rows.Close()

	var posts []m.Post
	for rows.Next() {
		var post m.Post
		var tags string
		err = rows.Scan(&post.PostID, &post.Title, &post.Author, &post.LastUpdated, &tags)
		if err != nil {
			fmt.Println("Error scanning rows in getposts")
			fmt.Println(err.Error())
			c.JSON(http.StatusInternalServerError, m.PostsResponse{
				Error: "Internal error",
			})
			return
		}

		// Get all tags
		var tagItems []m.Tag
		allTags := strings.Split(tags, ",")
		colorQuery := `
		SELECT c.Color
		FROM color c
		JOIN tag t ON t.Tag = c.Tag
		WHERE t.Tag = ?
		`
		for _, tag := range allTags {
			// Get the color for the tag
			colorRows, err := DB.Query(colorQuery, tag)
			if err != nil {
				fmt.Println("Error with get colors query")
				c.JSON(http.StatusInternalServerError, m.PostsResponse{
					Error: "Internal error",
				})
				return
			}
			defer colorRows.Close()

			if colorRows.Next() {
				var color string
				err = colorRows.Scan(&color)
				if err != nil {
					fmt.Println("Error scanning in color")
					c.JSON(http.StatusInternalServerError, m.PostsResponse{
						Error: "Internal error",
					})
					return
				}

				// Add the new tag to the tag list
				newTag := m.Tag{
					Tag:   tag,
					Color: color,
				}
				tagItems = append(tagItems, newTag)
			}
		}
		post.Tags = tagItems
		posts = append(posts, post)
	}

	c.JSON(http.StatusOK, m.PostsResponse{
		Error: "",
		Posts: posts,
	})
}

func GetForumPost(c *gin.Context) {
	c.Header("Access-Control-Allow-Origin", "*")
	query := `
	SELECT
		p.PostID,
		p.Title,
		p.Text,
		u.Name AS Author,
		u.UserID AS UserID,
		p.CreatedAt,
		GROUP_CONCAT(t.Tag) AS tags
	FROM
		post p
	INNER JOIN
		user u ON p.UserID = u.UserID
	LEFT JOIN
		tag t ON p.PostID = t.PostID
	WHERE
		p.PostID = ?
	GROUP BY
    	p.PostID, p.Title, p.Text, u.Name, p.CreatedAt;
	`
	id := c.Param("id")
	var response m.PostResponse

	rows, err := DB.Query(query, id)
	if err != nil {
		fmt.Println("Error querying in getforumpost")
		c.JSON(http.StatusInternalServerError, m.PostResponse{
			Error: "Internal error",
		})
		return
	}
	defer rows.Close()

	var allTags []string
	if rows.Next() {
		var tags string
		err = rows.Scan(&response.PostID, &response.Title, &response.Text, &response.Author, &response.UserID, &response.CreatedAt, &tags)
		if err != nil {
			fmt.Println("Error scanning rows in getforumpost")
			c.JSON(http.StatusInternalServerError, m.PostResponse{
				Error: "Internal error",
			})
			return
		}
		allTags = strings.Split(tags, ",")
	} else {
		fmt.Println("Post not found with post id: " + id)
		c.JSON(http.StatusNotFound, m.PostResponse{
			Error: "Not found",
		})
		return
	}

	// Get tag colors
	var tagItems []m.Tag
	colorQuery := `
	SELECT c.Color
	FROM color c
	JOIN tag t ON t.Tag = c.Tag
	WHERE t.Tag = ?
	`
	for _, tag := range allTags {
		// Get the color for the tag
		colorRows, err := DB.Query(colorQuery, tag)
		if err != nil {
			fmt.Println("Error with get colors query")
			c.JSON(http.StatusInternalServerError, m.PostResponse{
				Error: "Internal error",
			})
			return
		}
		defer colorRows.Close()

		if colorRows.Next() {
			var color string
			err = colorRows.Scan(&color)
			if err != nil {
				fmt.Println("Error scanning in color")
				c.JSON(http.StatusInternalServerError, m.PostResponse{
					Error: "Internal error",
				})
				return
			}

			// Add the new tag to the tag list
			newTag := m.Tag{
				Tag:   tag,
				Color: color,
			}
			tagItems = append(tagItems, newTag)
		}
	}
	response.Tags = tagItems

	// Now we just need to find the comments for the response
	commentQuery := `
	SELECT
		c.CommentID,
		c.Text,
		c.CreatedAt,
		u.Name AS Author,
		u.UserID AS UserID
	FROM
		comment c
	INNER JOIN
		user u ON c.UserID = u.UserID
	WHERE
    	c.PostID = ?
	ORDER BY
		c.CreatedAt DESC
	`

	rows, err = DB.Query(commentQuery, id)
	if err != nil {
		fmt.Println("Error querying for comments in getforumpost")
		c.JSON(http.StatusInternalServerError, m.PostResponse{
			Error: "Internal error",
		})
		return
	}
	defer rows.Close()

	var comments []m.Comment
	for rows.Next() {
		var comment m.Comment
		err = rows.Scan(&comment.Id, &comment.Text, &comment.CreatedAt, &comment.Author, &comment.UserID)
		if err != nil {
			fmt.Println("Error scanning comment rows in getforumpost")
			c.JSON(http.StatusInternalServerError, m.PostResponse{
				Error: "Internal error",
			})
			return
		}

		comment.Text = quoteIDToUser(comment.Text)

		comments = append(comments, comment)
	}

	response.Comments = comments
	c.JSON(http.StatusOK, response)
}

// Max: "Would you be able to implement a backend function that returns a list of existing tags ?
// Because I was thinking when a user creates a post they are able attribute existing tags to their post.
// I was thinking tags would be associated with “communities” as well so when a new community is created
// a new tag would have to be created,"
func GetTags(c *gin.Context) {
	c.Header("Access-Control-Allow-Origin", "*")
	query := `
	SELECT DISTINCT t.Tag, c.Color
	FROM tag t
	JOIN color c ON t.Tag = c.Tag;
	`

	rows, err := DB.Query(query)
	if err != nil {
		fmt.Println("Error querying in gettags")
		c.JSON(http.StatusInternalServerError, m.TagResponse{
			Error: "Internal error",
		})
		return
	}
	defer rows.Close()

	var tags []m.Tag
	for rows.Next() {
		var tag m.Tag
		err := rows.Scan(&tag.Tag, &tag.Color)
		if err != nil {
			fmt.Println("Error scanning in tag in gettags")
			c.JSON(http.StatusInternalServerError, m.TagResponse{
				Error: "Internal error",
			})
			return
		}
		tags = append(tags, tag)
	}

	c.JSON(http.StatusOK, m.TagResponse{
		Tags: tags,
	})
}

func DeletePost(c *gin.Context) {
	c.Header("Access-Control-Allow-Origin", "http://localhost:5173")
	c.Header("Access-Control-Allow-Credentials", "true")
	id := c.Param("id")

	if !userIsPostOwner(c) {
		c.JSON(http.StatusUnauthorized, m.LoginResponse{
			Error: "Unauthorized to delete post",
		})
		return
	}

	// Before we delete the post, we have to delete all of its comments
	commentQuery := `
	DELETE FROM comment
	WHERE PostID = ?`
	_, err := DB.Exec(commentQuery, id)
	if err != nil {
		fmt.Println("ERROR: " + err.Error())
		c.JSON(http.StatusInternalServerError, m.LoginResponse{
			Error: "Internal error",
		})
		return
	}

	// And all of its tags
	tagQuery := `
	DELETE FROM tag
	WHERE PostID = ?`
	_, err = DB.Exec(tagQuery, id)
	if err != nil {
		fmt.Println("ERROR: " + err.Error())
		c.JSON(http.StatusInternalServerError, m.LoginResponse{
			Error: "Internal error",
		})
		return
	}

	// Now we should be able to delete the post
	query := `
	DELETE FROM post
	WHERE PostID = ?`
	_, err = DB.Exec(query, id)
	if err != nil {
		fmt.Println("ERROR: " + err.Error())
		c.JSON(http.StatusInternalServerError, m.LoginResponse{
			Error: "Internal error",
		})
		return
	}

	c.JSON(http.StatusOK, m.LoginResponse{
		Message: "Post deleted",
	})
}

func DeleteComment(c *gin.Context) {
	c.Header("Access-Control-Allow-Origin", "http://localhost:5173")
	c.Header("Access-Control-Allow-Credentials", "true")
	id := c.Param("id")

	if !userIsCommentOwner(c) {
		c.JSON(http.StatusUnauthorized, m.LoginResponse{
			Error: "Unauthorized to delete post",
		})
		return
	}

	query := `
	DELETE FROM comment
	WHERE CommentID = ?`
	_, err := DB.Exec(query, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, m.LoginResponse{
			Error: "Internal error",
		})
		return
	}

	c.JSON(http.StatusOK, m.LoginResponse{
		Message: "Comment deleted",
	})
}

// Search all forum posts for the given phrase or keyword
func Search(c *gin.Context) {
	c.Header("Access-Control-Allow-Origin", "*")
	var searchRequest m.SearchRequest
	c.BindJSON(&searchRequest)
	// The phrase we're going to search for
	phrase := searchRequest.Keyword

	query := `
	SELECT
		p.PostID,
		p.Title,
		p.Text,
		u.Name AS Author,
		p.LastUpdated,
		GROUP_CONCAT(t.Tag) AS tags
	FROM
		post p
	INNER JOIN
		user u ON p.UserID = u.UserID
	LEFT JOIN
		tag t ON p.PostID = t.PostID
	GROUP BY
		p.PostID, p.Title, u.Name, p.LastUpdated
	ORDER BY
		p.LastUpdated DESC
	`

	rows, err := DB.Query(query)
	if err != nil {
		fmt.Println("Error with query in search func")
		c.JSON(http.StatusInternalServerError, m.PostsResponse{
			Error: "Internal error",
		})
		return
	}
	defer rows.Close()

	var posts []m.Post
	for rows.Next() {
		var spost m.SearchPost
		var tags string
		err = rows.Scan(&spost.PostID, &spost.Title, &spost.Text, &spost.Author, &spost.LastUpdated, &tags)
		if err != nil {
			fmt.Println("Error scanning rows in getposts")
			fmt.Println(err.Error())
			c.JSON(http.StatusInternalServerError, m.PostsResponse{
				Error: "Internal error",
			})
			return
		}

		var post m.Post
		// This is where we see if the posts include our phrase
		if strings.Contains(strings.ToLower(spost.Title), strings.ToLower(phrase)) ||
			strings.Contains(strings.ToLower(spost.Text), strings.ToLower(phrase)) {
			post = spostToPost(spost)
		} else {
			continue
		}

		// Get all tags
		var tagItems []m.Tag
		allTags := strings.Split(tags, ",")
		colorQuery := `
		SELECT c.Color
		FROM color c
		JOIN tag t ON t.Tag = c.Tag
		WHERE t.Tag = ?
		`
		for _, tag := range allTags {
			// Get the color for the tag
			colorRows, err := DB.Query(colorQuery, tag)
			if err != nil {
				fmt.Println("Error with get colors query")
				c.JSON(http.StatusInternalServerError, m.PostsResponse{
					Error: "Internal error",
				})
				return
			}
			defer colorRows.Close()

			if colorRows.Next() {
				var color string
				err = colorRows.Scan(&color)
				if err != nil {
					fmt.Println("Error scanning in color")
					c.JSON(http.StatusInternalServerError, m.PostsResponse{
						Error: "Internal error",
					})
					return
				}

				// Add the new tag to the tag list
				newTag := m.Tag{
					Tag:   tag,
					Color: color,
				}
				tagItems = append(tagItems, newTag)
			}
		}
		post.Tags = tagItems
		posts = append(posts, post)
	}

	c.JSON(http.StatusOK, m.PostsResponse{
		Error: "",
		Posts: posts,
	})
}

func spostToPost(s m.SearchPost) m.Post {
	return m.Post{
		PostID:      s.PostID,
		Title:       s.Title,
		Author:      s.Author,
		LastUpdated: s.LastUpdated,
	}
}

// Helper function to check if the user making the request is authorized to delete the post
func userIsPostOwner(c *gin.Context) bool {
	user_id := getUserIdFromSession(c)

	var post_user_id string
	query := `
	SELECT UserID
	FROM post
	WHERE PostID = ?`
	rows, err := DB.Query(query, c.Param("id"))
	if err != nil {
		fmt.Println("Error querying in userIsPostOwner func")
		return false
	}
	defer rows.Close()
	if !rows.Next() {
		fmt.Println("No user found for post id")
		return false
	} else {
		rows.Scan(&post_user_id)
	}

	return user_id == post_user_id
}

// Helper function to check if the user making the request is authorized to delete the comment
func userIsCommentOwner(c *gin.Context) bool {
	user_id := getUserIdFromSession(c)
	var comment_user_id string
	query := `
	SELECT UserID
	FROM comment
	WHERE CommentID = ?`
	rows, err := DB.Query(query, c.Param("id"))
	if err != nil {
		fmt.Println("Error querying in userIsCommentOwner func")
		return false
	}
	defer rows.Close()
	if !rows.Next() {
		fmt.Println("No user found for post id")
		return false
	} else {
		rows.Scan(&comment_user_id)
	}
	return user_id == comment_user_id
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

// Make a random color that's not too close to white
func randomColor() string {
	var r, g, b int
	for {
		r = rand.Intn(256)
		g = rand.Intn(256)
		b = rand.Intn(256)

		// Logic to make sure our color isn't too close to white for readability
		// As long as all values aren't 190 or higher I think we're good
		if !(r >= 190 && g >= 190 && b >= 190) {
			break
		}
	}

	color := fmt.Sprintf("#%02x%02x%02x", r, g, b)
	return color
}

func removeNestedQuotes(body string) string {
	openingTag := "[Quote="
	closingTag := "[/Quote]"

	openIndex := strings.Index(body, openingTag)
	if openIndex == -1 {
		return body
	}

	closeIndex := strings.LastIndex(body, closingTag)
	if closeIndex == -1 {
		return body
	}

	// I thought this was really sloppy but I think it's actually not bad.
	// I don't think we'll have problems with this even though it's scuffed
	toScan := body[openIndex+len(openingTag)+37 : closeIndex]
	firstPart := body[0 : openIndex+len(openingTag)+37]
	lastPart := body[closeIndex:]
	secondPart := deleteAllQuotes(toScan)
	return firstPart + secondPart + lastPart
}

func deleteAllQuotes(s string) string {
	re := regexp.MustCompile(`\[Quote=[^\]]+\][^\[]*?\[/Quote\]`)
	return re.ReplaceAllString(s, "")
}

func quoteIDToUser(s string) string {
	openingTag := "[Quote="
	closingTag := "[/Quote]"

	openIndex := strings.Index(s, openingTag)
	if openIndex == -1 {
		return s
	}

	closeIndex := strings.LastIndex(s, closingTag)
	if closeIndex == -1 {
		return s
	}

	user_id := s[openIndex+len(openingTag) : openIndex+len(openingTag)+36]
	// Now that we isolated the user_id, we can get the username from the db
	rows, _ := DB.Query(`
	SELECT Name
	FROM user
	WHERE UserID = ?
	`, user_id)
	var name string
	if rows.Next() {
		rows.Scan(&name)
	} else {
		return s
	}

	// Now we just replace user id with their name
	return strings.Replace(s, user_id, name, 1)
}
