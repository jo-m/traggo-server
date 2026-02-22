import {gql} from 'apollo-boost';

export const Bookmarks = gql`
    query Bookmarks {
        bookmarks {
            id
            tags {
                key
                value
            }
        }
    }
`;

export const CreateBookmark = gql`
    mutation CreateBookmark($tags: [InputTimeSpanTag!]!) {
        createBookmark(tags: $tags) {
            id
            tags {
                key
                value
            }
        }
    }
`;

export const RemoveBookmark = gql`
    mutation RemoveBookmark($id: Int!) {
        removeBookmark(id: $id) {
            id
            tags {
                key
                value
            }
        }
    }
`;
