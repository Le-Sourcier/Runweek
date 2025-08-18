import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.locale('fr');

export const parseDate = (date: string, format: string = 'DD MMMM YYYY à HH:mm'): string => {
	const parsedDate = dayjs(date);

	if (parsedDate.isSame(dayjs(), 'day')) {
		return `Aujourd'hui à ${parsedDate.format('HH:mm')}`;
	}
	if (parsedDate.isSame(dayjs().subtract(1, 'day'), 'day')) {
		return `Hier à ${parsedDate.format('HH:mm')}`;
	}
	return parsedDate.format(format);
}

export const formatTimeAgo = (timestamp: string): string => {
	const parsedDate = dayjs(timestamp);
	return parsedDate.fromNow();
}