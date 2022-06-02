${meta({
	title: "Notifier Test",
})}
${manifest()}

This page is a test of the [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API) and [Periodic Sync API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Periodic_Background_Synchronization_API) as a possible mechanism for our visitors to subscribe to news and updates from us. The idea would be to publish an RSS feed and supply a little RSS reader app that subscribes to our own feed by default. And of course, the feed could subscribe to any app that supports CORS out of the box &mdash; and probably non-CORS feeds for a small fee. 💸

```mermaid
graph LR
	Site -- build --> RSS
	Browser -- install --> app("Reader App")
	app -- periodic sync --> RSS
	app -- notify --> Browser
	Browser -- display --> Notification
```

When I first started tinkering with this, I had assumed this API was ubiquitous at this point. But, *it's not!* As of 2022-05-30, [the Notifications API is not supported in Mobile Safari](https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification#browser_compatibility), and ([Periodic Background sync](https://developer.mozilla.org/en-US/docs/Web/API/Web_Periodic_Background_Synchronization_API#browser_compatibility)) is not supported in Mobile Safari *or Firefox*.

So, if you're on Mobile Safari, this demo won't work for you *at all*. If you're in Firefox, the background notifications portion won't work.

### For the rest of the world ...

The notifications interface is pretty straightforward. A notification can be triggered by requesting permissions and then creating a new \`Notification\` object. A basic \`Notification\` can include a title, icon, and message body. Notifications triggered from a service worker can also include actions!

```js
this.requestButton.onclick = () => {
	Notification.requestPermission().then(() => {
		if (Notification.permission === 'granted') {
			alert('Thanks!\\nYou can issue a notification now.');
		} else {
			alert('Oh no!\\nDid you really mean to block notifications???');
		}
	});
};

this.notifyButton.onclick = () => {
	if (Notification.permission === 'granted') {
		const notification = new Notification("Title Goes Here", {
			body: "More details can go in the body of the notification. You can also specify an icon.",
			icon: "/images/favicon.ico"
		});
	} else {
		alert("Notifications can't be tested until you Request + Grant permission.\\n(You can revoke permissions later.)")
	}
};


this.scheduleButton.onclick = () => {
	navigator.serviceWorker.ready.then(registration => {
		registration.periodicSync.register('test-notifications', {
			minInterval: 12 * 60 * 60 * 1000
		}).then(() => {
			alert('scheduled');
		}).catch(e => {
			if (e.message.includes('Permission denied')) {
				alert('You need to install the app first!');
			} else {
				alert('Unable to schedule! See console for details.');
				console.error(e);
			}
		});
	});
};

this.unscheduleButton.onclick = () => {
	navigator.serviceWorker.ready.then(registration => {
		registration.periodicSync.unregister('test-notifications').then(
			() => {
				alert('un-scheduled');
			}
		);
	});
};
```

<div><tpdc:notificationtest></tpdc:notificationtest></div>

Before you can issue a notification, the page needs need to request permission. You can see this by clicking **Request Permission** above.

You can then click **Issue Notification** to see a notification looks like in your OS. And finally, if you **Install** the app, you can schedule periodic syncs, which will trigger notifications. These only occur about once per day. So, if you want to manually trigger this. Chrome and Edge [provide a UI in the dev tools](https://devtoolstips.org/tips/en/force-pwa-periodic-sync/) to trigger a periodic sync. (You can leave the \`tag\` as-is.)

That's it for this little experiment. If I circle back to this, I'll build a little notifier app to serve as a news reader.

Or you can stay in touch on Github. 😁

<div><tpdc:subscribe></tpdc:subscribe></div>

Full source for this example is in [the repo on Github](https://github.com/svidgen/www.thepointless.com/blob/master/src/routes/experimental/notifier/).

<script src='index.js'></script>