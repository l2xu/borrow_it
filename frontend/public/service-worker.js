/* eslint-disable no-restricted-globals */

// Listening for push events to show notifications
self.addEventListener("push", (event) => {
	const data = event.data.json();
	self.registration.showNotification(data.title, {
		body: data.message,
		icon: "/images/192.png",
	});
});

