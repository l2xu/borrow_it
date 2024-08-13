/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				ubuntu: ["Ubuntu", "sans-serif"],
			},
			fontWeight: {
				regular: 400,
				medium: 500,
			},
			colors: {
				white: "#FFFFFF",
				accent: "#597AE8",
				signal: "#DC2626",
				gray: "#BFBFBF",
				black: "#000000",
			},
		},
	},
	plugins: [],
};
