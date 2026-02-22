package model

// Bookmark is a saved set of tags for quick timer starting.
type Bookmark struct {
	ID     int `gorm:"primary_key;unique_index;AUTO_INCREMENT"`
	UserID int `gorm:"type:int REFERENCES users(id) ON DELETE CASCADE"`
	Tags   []BookmarkTag
}

// BookmarkTag is a tag for a bookmark.
type BookmarkTag struct {
	BookmarkID  int `gorm:"type:int REFERENCES bookmarks(id) ON DELETE CASCADE"`
	Key         string
	StringValue string
}
