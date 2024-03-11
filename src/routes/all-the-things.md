${meta({
	title: "all the things"
})}
This is all the stuff.

<ul class='link-list'>
${Object.entries(require('../sitemap.js').features).map(([url, title]) => {
	return `<li><a href="${url}" title="${title}">${title}</a></li>`;
}).join('')}
</ul>

Or at least *some* stuff.

Some stuff is pending.

Other stuff is missing.
