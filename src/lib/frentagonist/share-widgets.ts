import { ShareWidget } from '../../components/share-widget';

export function FrentagonistShareWidget({ text, url }: { text: string; url: string }) {
	return ShareWidget({
		header: 'Share to separate the friends from the foes.',
		title: 'My Frentagonist Profile',
		text,
		url,
		preview: true,
	});
}
