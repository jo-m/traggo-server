import {Trackers_timers} from '../gql/__generated__/Trackers';
import {Tags_tags} from '../gql/__generated__/Tags';
import {toTagSelectorEntry} from '../tag/tagSelectorEntry';
import moment from 'moment';
import {TimeSpanProps} from './TimeSpan';
import {TimeSpans_timeSpans_timeSpans} from '../gql/__generated__/TimeSpans';

export const toTimeSpanProps = (timers: Trackers_timers[], tags: Tags_tags[]): TimeSpanProps[] => {
    return [...timers].map((timer) => {
        const tagEntries = toTagSelectorEntry(tags, timer.tags || []);
        const range: TimeSpanProps['range'] = {from: moment.parseZone(timer.start)};
        if (timer.end) {
            range.to = moment.parseZone(timer.end);
        }
        return {
            id: timer.id,
            range: {
                ...range,
                oldFrom: timer.oldStart ? moment(timer.oldStart) : undefined,
            },
            initialTags: tagEntries,
            note: timer.note,
        };
    });
};

type GroupedByIndex = Record<string, TimeSpans_timeSpans_timeSpans[]>;
type GroupedDayStart = Record<string, number>;
const group = (
    startOfTomorrow: moment.Moment,
    startOfToday: moment.Moment,
    startOfYesterday: moment.Moment,
    dayStarts: GroupedDayStart
) => (a: GroupedByIndex, current: TimeSpans_timeSpans_timeSpans): GroupedByIndex => {
    const startTime = moment(current.oldStart || current.start);
    let date = `${startTime.format('dddd')}, ${startTime.format('LL')}`;
    if (startTime.isBetween(startOfToday, startOfTomorrow)) {
        date = `${date} (today)`;
    } else if (startTime.isBetween(startOfYesterday, startOfToday)) {
        date = `${date} (yesterday)`;
    }
    a[date] = [...(a[date] || []), current];
    if (!(date in dayStarts)) {
        dayStarts[date] = moment(startTime)
            .startOf('day')
            .unix();
    }
    return a;
};

export type GroupedTimeSpanProps = Array<{key: string; timeSpans: TimeSpanProps[]; totalSeconds: number; isToday: boolean}>;

export const toGroupedTimeSpanProps = (
    timeSpans: TimeSpans_timeSpans_timeSpans[],
    tags: Tags_tags[],
    now: moment.Moment
): GroupedTimeSpanProps => {
    const dayStarts: GroupedDayStart = {};
    const startOfToday = moment(now).startOf('day');
    const startOfTomorrow = moment(now)
        .add(1, 'day')
        .startOf('day');
    const startOfYesterday = moment(now)
        .subtract(1, 'day')
        .startOf('day');
    const datesWithTimeSpans: GroupedByIndex = timeSpans.reduce(
        group(startOfTomorrow, startOfToday, startOfYesterday, dayStarts),
        {}
    );
    return Object.keys(datesWithTimeSpans).map((key) => {
        const groupedTimeSpans = datesWithTimeSpans[key];
        const dayStartUnix = dayStarts[key];
        const dayEndUnix = dayStartUnix + 86400;
        let totalSeconds = 0;
        for (const ts of groupedTimeSpans) {
            if (!ts.end) {
                continue;
            }
            const startUnix = Math.max(moment.parseZone(ts.start).unix(), dayStartUnix);
            const endUnix = Math.min(moment.parseZone(ts.end).unix(), dayEndUnix);
            if (endUnix > startUnix) {
                totalSeconds += endUnix - startUnix;
            }
        }
        return {
            key,
            timeSpans: toTimeSpanProps(groupedTimeSpans, tags),
            totalSeconds,
            isToday: key.includes('(today)'),
        };
    });
};
