package bookmark

import "github.com/jinzhu/gorm"

// ResolverForBookmark resolves bookmark specific things.
type ResolverForBookmark struct {
	DB *gorm.DB
}
