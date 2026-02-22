package bookmark

import (
	"context"
	"fmt"

	"github.com/traggo/server/auth"
	"github.com/traggo/server/generated/gqlmodel"
	"github.com/traggo/server/model"
)

// CreateBookmark creates a bookmark.
func (r *ResolverForBookmark) CreateBookmark(ctx context.Context, tags []*gqlmodel.InputTimeSpanTag) (*gqlmodel.Bookmark, error) {
	if len(tags) == 0 {
		return nil, fmt.Errorf("bookmark must have at least one tag")
	}

	bookmark := model.Bookmark{
		UserID: auth.GetUser(ctx).ID,
		Tags:   tagsToInternal(tags),
	}

	r.DB.Create(&bookmark)

	return bookmarkToExternal(bookmark), nil
}
