// The truncateMessage function is used to truncate a message to a specified length.
// The function takes a message and maxLength as arguments and returns the truncated message.
export const truncateMessage = (message, maxLength) => {
	if (message && message.length > maxLength) {
		return message.slice(0, maxLength) + "...";
	}
	return message;
};
