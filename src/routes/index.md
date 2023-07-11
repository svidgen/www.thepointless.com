${meta({
	title: "Home",
	author: "Jon Wire",
	description: "This is a site about things and stuff."
})}

In an internet of darkness there shines forth a **light**.

Miscellaneous "bros" are trying to scam you out of your money with Web 3.0 and NFT crypto hax. But, here we are, just **M**aking W**E**b 1.0 **G**reat **A**gain. (**MEGA**)

### Just remember one thing.

## I will step on any house I choose.

<p style='text-align: center'>
	<img
		src='/images/big_giant.png'
		alt='Angry Stickman'
		style='border: 1px solid green; background-color: white'
	/>
</p>

We believe this is an acceptable compromise for greatness.

---

## The News

${(() => {
	const news = require(__dirname + '/src/news');
	return news.map(({title, link, body, description, pubDate}) => `
		### [${title}](${link})
		*${pubDate}*

		${body}
	`)
})()}