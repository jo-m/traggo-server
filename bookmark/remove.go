package bookmark

import (
	"context"
	"fmt"

	"github.com/traggo/server/auth"
	"github.com/traggo/server/generated/gqlmodel"
	"github.com/traggo/server/model"
)

// RemoveBookmark removes a bookmark.
func (r *ResolverForBookmark) RemoveBookmark(ctx context.Context, id int) (*gqlmodel.Bookmark, error) {
	bookmark := model.Bookmark{ID: id}
	if r.DB.Preload("Tags").Where("user_id = ?", auth.GetUser(ctx).ID).Find(&bookmark).RecordNotFound() {
		return nil, fmt.Errorf("bookmark with id %d does not exist", id)
	}

	r.DB.Where(&model.Bookmark{ID: id}).Delete(new(model.Bookmark))

	return bookmarkToExternal(bookmark), nil
}
