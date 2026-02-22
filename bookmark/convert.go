package bookmark

import (
	"github.com/traggo/server/generated/gqlmodel"
	"github.com/traggo/server/model"
)

func bookmarkToExternal(b model.Bookmark) *gqlmodel.Bookmark {
	tags := make([]*gqlmodel.TimeSpanTag, 0, len(b.Tags))
	for _, tag := range b.Tags {
		tags = append(tags, &gqlmodel.TimeSpanTag{
			Key:   tag.Key,
			Value: tag.StringValue,
		})
	}
	return &gqlmodel.Bookmark{
		ID:   b.ID,
		Tags: tags,
	}
}

func tagsToInternal(gqls []*gqlmodel.InputTimeSpanTag) []model.BookmarkTag {
	result := make([]model.BookmarkTag, 0, len(gqls))
	for _, tag := range gqls {
		result = append(result, model.BookmarkTag{
			Key:         tag.Key,
			StringValue: tag.Value,
		})
	}
	return result
}
