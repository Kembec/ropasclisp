/** @type {import('tailwindcss').Config} */
// Colours and type resolve to the Kembec brand variables (src/styles/kembec-tokens.css, a verbatim
// copy of Personal/_marca/04-sistema/design-tokens.css). They flip with the theme, so one class
// serves light and dark; opacity modifiers do not apply to these and are not used.
const token = (name) => `var(--kembec-${name})`;

module.exports = {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,vue}"],
	theme: {
		extend: {
			colors: {
				ink: token("ink"),
				paper: token("paper"),
				secondary: token("secondary"),
				surface: token("surface"),
				rule: token("rule"),
				control: token("control"),
				seal: token("seal"),
				"seal-quiet": token("seal-quiet"),
				raised: token("raised"),
				edge: token("edge"),
				ok: token("ok"),
				pending: token("pending"),
			},
			fontFamily: {
				sans: token("font"),
				mono: token("font-code"),
			},
		},
	},
	plugins: [],
};
