module.exports = {
	darkMode: 'class',
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx}",
		"./src/components/**/*.{js,ts,jsx,tsx}"
	],
	mode: "jit",
	theme: {
		fontFamily: {
			'poppins': ['Poppins'],
			'inter': ['Inter'],
			'manrope': ['Manrope']
		},
		extend: {
			screens:{
				'xs': {'max': '368px'}
			}
		}
	},
	plugins: []
};
