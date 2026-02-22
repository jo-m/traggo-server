import * as React from 'react';
import {useQuery} from '@apollo/react-hooks';
import * as gqlTimeSpan from '../gql/timeSpan';
import {TimeSpansInRange, TimeSpansInRangeVariables} from '../gql/__generated__/TimeSpansInRange';
import {Trackers} from '../gql/__generated__/Trackers';
import {Typography} from '@material-ui/core';
import useInterval from '@rooks/use-interval';
import moment from 'moment';
import prettyMs from 'pretty-ms';

export const TodayTotal: React.FC = () => {
    const [now, setNow] = React.useState(moment());

    const timeSpansResult = useQuery<TimeSpansInRange, TimeSpansInRangeVariables>(gqlTimeSpan.TimeSpansInRange, {
        variables: {
            start: moment()
                .startOf('day')
                .format(),
            end: moment()
                .endOf('day')
                .format(),
        },
        fetchPolicy: 'cache-and-network',
    });

    const trackersResult = useQuery<Trackers>(gqlTimeSpan.Trackers, {
        fetchPolicy: 'cache-and-network',
    });

    const timerCount = (trackersResult.data && trackersResult.data.timers && trackersResult.data.timers.length) || 0;
    const prevTimerCount = React.useRef(timerCount);
    React.useEffect(() => {
        if (prevTimerCount.current !== timerCount) {
            prevTimerCount.current = timerCount;
            timeSpansResult.refetch();
        }
    }, [timerCount]); // eslint-disable-line react-hooks/exhaustive-deps

    useInterval(() => setNow(moment()), 1000, true);

    const totalSeconds = React.useMemo(() => {
        const dayStartUnix = moment()
            .startOf('day')
            .unix();
        const dayEndUnix = moment()
            .endOf('day')
            .unix();
        const nowUnix = now.unix();

        let total = 0;

        if (timeSpansResult.data && timeSpansResult.data.timeSpans) {
            for (const ts of timeSpansResult.data.timeSpans.timeSpans) {
                if (!ts.end) {
                    continue;
                }
                const startUnix = Math.max(moment.parseZone(ts.start).unix(), dayStartUnix);
                const endUnix = Math.min(moment.parseZone(ts.end).unix(), dayEndUnix);
                if (endUnix > startUnix) {
                    total += endUnix - startUnix;
                }
            }
        }

        if (trackersResult.data && trackersResult.data.timers) {
            for (const timer of trackersResult.data.timers) {
                const startUnix = Math.max(moment.parseZone(timer.start).unix(), dayStartUnix);
                if (nowUnix > startUnix) {
                    total += nowUnix - startUnix;
                }
            }
        }

        return total;
    }, [timeSpansResult.data, trackersResult.data, now]);

    const formatted = prettyMs(totalSeconds * 1000, {unitCount: 2});

    return (
        <Typography align="center" variant="h5" style={{marginTop: 10}}>
            Today: {formatted}
        </Typography>
    );
};
