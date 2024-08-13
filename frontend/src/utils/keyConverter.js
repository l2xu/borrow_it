// The keyConverter function is used to convert a base64-encoded key to a Uint8Array.
// The function takes a key as an argument and returns a Uint8Array.
export const keyConverter = (key) => {
	const padding = "=".repeat((4 - (key.length % 4)) % 4);
	const base64 = (key + padding).replace(/\-/g, "+").replace(/_/g, "/");

	const rawData = atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}

	return outputArray;
};
