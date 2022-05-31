const { DomClass } = require('wirejs-dom');

let worker;

const markup = `<tpdc:notificationtest>
	<input data-id='requestButton' type='button' value='Request Permission' />
	<input data-id='notifyButton' type='button' value='Issue Notification' />
	<input data-id='scheduleButton' type='button' value='Schedule Notifications' />
	<input data-id='unscheduleButton' type='button' value='Clear Scheduled Notifications' />
</tpdc:notificationtest>`;

const NotificationTest = DomClass(markup, function _NotificationTest() {
	this.requestButton.onclick = () => {
		Notification.requestPermission().then(() => {
			if (Notification.permission === 'granted') {
				alert('Thanks!\nYou can issue a notification now.');
			} else {
				alert('Oh no!\nDid you really mean to block notifications???');
			}
		});
	};

	this.notifyButton.onclick = () => {
		if (Notification.permission === 'granted') {
			const notification = new Notification("Title Goes Here", {
				body: "More details can go in the body of the notification.",
				icon: "/images/favicon.ico"
			});
		} else {
			alert("Notifications can't be tested until you Request + Grant permission.\n(You can revoke permissions later.)")
		}
	};

	this.scheduleButton.onclick = () => {
		navigator.serviceWorker.ready.then(registration => {
			registration.periodicSync.register('test-notifications', {
				minInterval: 1 * 60 * 60 * 1000
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
});

(async () => {
	if ('serviceWorker' in navigator) {
		worker = await navigator.serviceWorker.register(
			'sw.js?v=${BUILD_ID}', {
				scope: '/experimental/notifier/'
			}
		);
	};
})();

module.exports = NotificationTest;