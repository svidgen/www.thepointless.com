import type { Context } from 'wirejs-resources';

function escapeXml(input: unknown) {
	const s = String(input ?? '');
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

export async function generate(context?: Context) {
	const m = await import('../news.cjs');
	const news = (m && (m.default || m)) || [];

	const items = news.map(({ title, link, body, description, pubDate, guid }) => `
	<item>
		<title>${escapeXml(title)}</title>
		<link>${escapeXml(link)}</link>
		<description>${escapeXml(description || body || '')}</description>
		<pubDate>${escapeXml(pubDate)}</pubDate>
		<guid isPermaLink="false">${escapeXml(guid)}</guid>
	</item>`).join('\n');

	return `<?xml version="1.0" encoding="UTF-8" ?>
	<rss version="2.0"><channel>
		<title>www.thepointless.com</title>
		<link>https://www.thepointless.com</link>
		<description>Well. I mean. We're pretty awesome. So, there's that.</description>
		${items}
	</channel></rss>`;
}
