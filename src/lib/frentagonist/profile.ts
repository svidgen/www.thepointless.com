import { dimensions, PROFILE_VERSION, type Profile } from './dimensions';

export function encode(profile: Profile) {
	return btoa(unescape(encodeURIComponent(JSON.stringify({ v: PROFILE_VERSION, p: profile }))));
}

export function decode(value: string | null): Profile | null {
	try {
		if (!value) return null;
		const decoded = JSON.parse(decodeURIComponent(escape(atob(value))));
		return decoded && decoded.v === PROFILE_VERSION ? decoded.p : null;
	} catch {
		return null;
	}
}

export function compatibility(theirs: Profile, yours: Profile) {
	let total = 0;
	let score = 0;
	for (const [dimension, values] of Object.entries(dimensions)) {
		if (!Array.isArray(values)) continue;
		total += 4;
		score += 4 - Math.abs(values.indexOf(theirs[dimension as keyof Profile] as never) - values.indexOf(yours[dimension as keyof Profile] as never));
	}
	return Math.round((score / total) * 100);
}

export function shareString(profile: Profile) {
	return Object.entries(dimensions).map(([dimension, values]) => {
		if (dimension === 'Name' || !Array.isArray(values)) return '';
		let found = false;
		return values.map(value => {
			if (value === profile[dimension as keyof Profile]) {
				found = true;
				return '✅';
			}
			return found ? '🟦' : '🟥';
		}).join('');
	}).filter(Boolean).join('\n');
}

export function shareText(profile: Profile) {
	return [
		'My Frentagonist Profile',
		'',
		shareString(profile),
		'',
		'See if we should 🍻 or ⚔️.',
	].join('\n');
}
