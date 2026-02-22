package bookmark

import (
	"testing"

	"github.com/stretchr/testify/require"
	"github.com/traggo/server/generated/gqlmodel"
	"github.com/traggo/server/test"
	"github.com/traggo/server/test/fake"
)

func TestCreateBookmark(t *testing.T) {
	db := test.InMemoryDB(t)
	defer db.Close()
	db.User(5)

	resolver := ResolverForBookmark{DB: db.DB}
	result, err := resolver.CreateBookmark(fake.User(5), []*gqlmodel.InputTimeSpanTag{
		{Key: "project", Value: "traggo"},
	})

	require.NoError(t, err)
	require.Equal(t, &gqlmodel.Bookmark{
		ID: 1,
		Tags: []*gqlmodel.TimeSpanTag{
			{Key: "project", Value: "traggo"},
		},
	}, result)
	assertBookmarkCount(t, db, 1)
	assertBookmarkTagCount(t, db, 1)
}

func TestCreateBookmark_noTags(t *testing.T) {
	db := test.InMemoryDB(t)
	defer db.Close()
	db.User(5)

	resolver := ResolverForBookmark{DB: db.DB}
	result, err := resolver.CreateBookmark(fake.User(5), []*gqlmodel.InputTimeSpanTag{})

	require.Nil(t, result)
	require.EqualError(t, err, "bookmark must have at least one tag")
	assertBookmarkCount(t, db, 0)
}

func TestBookmarks_empty(t *testing.T) {
	db := test.InMemoryDB(t)
	defer db.Close()
	db.User(5)

	resolver := ResolverForBookmark{DB: db.DB}
	result, err := resolver.Bookmarks(fake.User(5))

	require.NoError(t, err)
	require.Empty(t, result)
}

func TestBookmarks_isolatedByUser(t *testing.T) {
	db := test.InMemoryDB(t)
	defer db.Close()
	db.User(1)
	db.User(2)

	resolver := ResolverForBookmark{DB: db.DB}

	_, err := resolver.CreateBookmark(fake.User(1), []*gqlmodel.InputTimeSpanTag{
		{Key: "project", Value: "a"},
	})
	require.NoError(t, err)

	_, err = resolver.CreateBookmark(fake.User(2), []*gqlmodel.InputTimeSpanTag{
		{Key: "project", Value: "b"},
	})
	require.NoError(t, err)

	result, err := resolver.Bookmarks(fake.User(1))
	require.NoError(t, err)
	require.Len(t, result, 1)
	require.Equal(t, "a", result[0].Tags[0].Value)

	result, err = resolver.Bookmarks(fake.User(2))
	require.NoError(t, err)
	require.Len(t, result, 1)
	require.Equal(t, "b", result[0].Tags[0].Value)
}

func TestRemoveBookmark(t *testing.T) {
	db := test.InMemoryDB(t)
	defer db.Close()
	db.User(5)

	resolver := ResolverForBookmark{DB: db.DB}
	created, err := resolver.CreateBookmark(fake.User(5), []*gqlmodel.InputTimeSpanTag{
		{Key: "project", Value: "traggo"},
	})
	require.NoError(t, err)

	result, err := resolver.RemoveBookmark(fake.User(5), created.ID)
	require.NoError(t, err)
	require.Equal(t, created.ID, result.ID)
	assertBookmarkCount(t, db, 0)
	assertBookmarkTagCount(t, db, 0)
}

func TestRemoveBookmark_notFound(t *testing.T) {
	db := test.InMemoryDB(t)
	defer db.Close()
	db.User(5)

	resolver := ResolverForBookmark{DB: db.DB}
	result, err := resolver.RemoveBookmark(fake.User(5), 999)

	require.Nil(t, result)
	require.EqualError(t, err, "bookmark with id 999 does not exist")
}

func TestRemoveBookmark_wrongUser(t *testing.T) {
	db := test.InMemoryDB(t)
	defer db.Close()
	db.User(1)
	db.User(2)

	resolver := ResolverForBookmark{DB: db.DB}
	created, err := resolver.CreateBookmark(fake.User(1), []*gqlmodel.InputTimeSpanTag{
		{Key: "project", Value: "traggo"},
	})
	require.NoError(t, err)

	result, err := resolver.RemoveBookmark(fake.User(2), created.ID)
	require.Nil(t, result)
	require.EqualError(t, err, "bookmark with id 1 does not exist")
	assertBookmarkCount(t, db, 1)
}
