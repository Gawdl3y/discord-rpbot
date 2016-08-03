import ua from 'universal-analytics';
import config from '../config';
import version from '../version';

export const user = config.analytics ? ua('UA-81182461-1', { https: true }) : null;

export function sendEvent(eventCategory, eventAction, eventLabel = null, eventValue = null) {
	if(user) {
		user.event({
			ec: eventCategory,
			ea: eventAction,
			el: eventLabel,
			ev: eventValue,
			an: 'RPBot',
			av: version
		}).send();
	}
}

export function sendException(err) {
	if(user) {
		user.exception({
			exd: `${err.name}: ${err.message}`,
			an: 'RPBot',
			av: version
		}).send();
	}
}
