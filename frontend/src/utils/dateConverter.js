// The parseDate function is used to parse a date string and return a formatted date string.
// It takes a date string as input and returns a formatted date string.
export const parseDate = (inputDate) => {
	const date = new Date(inputDate);
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const yesterday = new Date(today);
	yesterday.setDate(today.getDate() - 1);

	const time = date.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});

	if (date >= today) {
		// If the date is within today, return only the time
		return time;
	} else if (date >= yesterday) {
		// If the date is within yesterday, return "yesterday" and the time
		return `yesterday ${time}`;
	} else {
		// If the date is older, return the date in "dd.mm" format and the time
		const day = String(date.getDate()).padStart(2, "0");
		const month = String(date.getMonth() + 1).padStart(2, "0");
		return `${day}.${month} ${time}`;
	}
};
