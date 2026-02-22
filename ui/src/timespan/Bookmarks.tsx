import * as React from 'react';
import {useQuery, useMutation} from '@apollo/react-hooks';
import * as gqlBookmark from '../gql/bookmark';
import * as gqlTag from '../gql/tags';
import * as gqlTimeSpan from '../gql/timeSpan';
import {Bookmarks as BookmarksData} from '../gql/__generated__/Bookmarks';
import {RemoveBookmark, RemoveBookmarkVariables} from '../gql/__generated__/RemoveBookmark';
import {StartTimer, StartTimerVariables} from '../gql/__generated__/StartTimer';
import {Tags} from '../gql/__generated__/Tags';
import {TagChip} from '../common/TagChip';
import {IconButton, Typography} from '@material-ui/core';
import {PlayArrow, Close} from '@material-ui/icons';
import Paper from '@material-ui/core/Paper';
import moment from 'moment';
import {inUserTz} from './timeutils';

export const Bookmarks = () => {
    const bookmarksResult = useQuery<BookmarksData>(gqlBookmark.Bookmarks, {fetchPolicy: 'cache-and-network'});
    const tagsResult = useQuery<Tags>(gqlTag.Tags, {fetchPolicy: 'cache-and-network'});
    const [startTimer] = useMutation<StartTimer, StartTimerVariables>(gqlTimeSpan.StartTimer, {
        refetchQueries: [{query: gqlTimeSpan.Trackers}],
    });
    const [removeBookmark] = useMutation<RemoveBookmark, RemoveBookmarkVariables>(gqlBookmark.RemoveBookmark, {
        refetchQueries: [{query: gqlBookmark.Bookmarks}],
    });

    if (
        bookmarksResult.loading ||
        bookmarksResult.error ||
        !bookmarksResult.data ||
        tagsResult.loading ||
        tagsResult.error ||
        !tagsResult.data ||
        !tagsResult.data.tags
    ) {
        return null;
    }

    const bookmarks = bookmarksResult.data.bookmarks;
    if (bookmarks.length === 0) {
        return null;
    }

    const tagDefs = tagsResult.data.tags;

    return (
        <>
            <Typography align="center" variant="h5" style={{marginTop: 10}}>
                Bookmarks
            </Typography>
            {bookmarks.map((bookmark) => (
                <Paper
                    key={bookmark.id}
                    elevation={1}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '5px 10px',
                        margin: '10px 0',
                    }}>
                    <div style={{flex: 1, display: 'flex', flexWrap: 'wrap'}}>
                        {bookmark.tags.map((tag) => {
                            const def = tagDefs.find((d) => d.key === tag.key);
                            return (
                                <TagChip
                                    key={tag.key + ':' + tag.value}
                                    label={tag.key + ':' + tag.value}
                                    color={def ? def.color : 'gray'}
                                />
                            );
                        })}
                    </div>
                    <IconButton
                        size="small"
                        onClick={() => {
                            startTimer({
                                variables: {
                                    start: inUserTz(moment()).format(),
                                    tags: bookmark.tags.map((t) => ({key: t.key, value: t.value})),
                                    note: '',
                                },
                            });
                        }}>
                        <PlayArrow />
                    </IconButton>
                    <IconButton size="small" onClick={() => removeBookmark({variables: {id: bookmark.id}})}>
                        <Close />
                    </IconButton>
                </Paper>
            ))}
        </>
    );
};
