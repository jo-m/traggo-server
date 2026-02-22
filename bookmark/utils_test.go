package bookmark

import (
	"testing"

	"github.com/stretchr/testify/require"
	"github.com/traggo/server/model"
	"github.com/traggo/server/test"
)

func assertBookmarkCount(t *testing.T, db *test.Database, expected int) {
	count := new(int)
	db.Model(new(model.Bookmark)).Count(count)
	require.Equal(t, expected, *count)
}

func assertBookmarkTagCount(t *testing.T, db *test.Database, expected int) {
	count := new(int)
	db.Model(new(model.BookmarkTag)).Count(count)
	require.Equal(t, expected, *count)
}
