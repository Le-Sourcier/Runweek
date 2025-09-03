import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import 'dayjs/locale/en';
import relativeTime from "dayjs/plugin/relativeTime";
import { Language } from '../types/message';

dayjs.extend(relativeTime);


const loadLocale = async (locale: Language) => {
	await import(`dayjs/locale/${locale}`);
	dayjs.locale(locale);
};

export const parseDate = async (date: string, format: string = 'DD MMMM YYYY à HH:mm', locale: Language = 'fr'): Promise<string> => {
	await loadLocale(locale);
	const parsedDate = dayjs(date).locale(locale);

	if (parsedDate.isSame(dayjs(), 'day')) {
		const todayString = locale === 'fr' ? 'Aujourd\'hui à' : 'Today at';
		return `${todayString} ${parsedDate.format('HH:mm')}`;
	}
	if (parsedDate.isSame(dayjs().subtract(1, 'day'), 'day')) {
		const yesterdayString = locale === 'fr' ? 'Hier à' : 'Yesterday at';
		return `${yesterdayString} ${parsedDate.format('HH:mm')}`;
	}
	return parsedDate.format(format);
}

export const formatTimeAgo = async (timestamp: string, locale: Language = 'fr'): Promise<string> => {
	await loadLocale(locale);
	return dayjs(timestamp).locale(locale).fromNow();
}