package bookmark

import (
	"context"

	"github.com/traggo/server/auth"
	"github.com/traggo/server/generated/gqlmodel"
	"github.com/traggo/server/model"
)

// Bookmarks returns all bookmarks for a user.
func (r *ResolverForBookmark) Bookmarks(ctx context.Context) ([]*gqlmodel.Bookmark, error) {
	var bookmarks []model.Bookmark
	r.DB.Preload("Tags").Where("user_id = ?", auth.GetUser(ctx).ID).Find(&bookmarks)

	result := make([]*gqlmodel.Bookmark, 0, len(bookmarks))
	for _, b := range bookmarks {
		result = append(result, bookmarkToExternal(b))
	}
	return result, nil
}
