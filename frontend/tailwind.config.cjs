module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{html,js,jsx,ts,tsx,vue}',
  ],
  theme: {
    extend: {
      colors: {
        green: '#283226',
        black: '#151515',
        khaki: '#666048',
        fluogreen: '#4EE1A0',
        grey: '#D9D9D9',
        white: '#E7E7E7',
        textWhite: "#FFFFFF",
        // Dark mode colors
        dark: {
          green: '#1A1F1C',
          black: '#000000',
          khaki: '#4C4A36',
          fluogreen: '#3BBF7D',
          grey: '#A6A6A6',
          white: '#F0F0F0',
        },
      },
      fontFamily: {
        poppins: ['"Poppins"', 'sans-serif'],
      },
      fontSize: {
        '88px': ['88px', { lineHeight: '88px', letterSpacing: '-0.025em' }],
        '48px': ['48px', { lineHeight: '56px', letterSpacing: '-0.015em' }],
        '24px': ['24px', { lineHeight: '32px', letterSpacing: '0em' }],
        '18px': ['18px', { lineHeight: '28px', letterSpacing: '0em' }],
      },
    },
  },
  plugins: [],
}