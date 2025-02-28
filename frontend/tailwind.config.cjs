module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{html,js,jsx,ts,tsx,vue}',
  ],
  theme: {
    extend: {
      colors: {
        fireGradientStart: '#ff4500',
        fireGradientMiddle: '#ff6347',
        fireGradientEnd: '#ff8c00',
        fireGradientLight: '#ffd700', 
        green: '#283226',
        black: '#151515',
        khaki: '#666048',
        fluogreen: '#4EE1A0',
        grey: '#D9D9D9',
        white: '#E7E7E7',
        textWhite: "#FFFFFF",
        adminbg: "#667085",
        guidebg: "#268750",
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
      backgroundImage: {
        'fire-gradient': 'linear-gradient(to right, #ff4500, #ff6347, #ff8c00, #ffd700)', 
        'heroSec': 'https://burundipearl.com/wp-content/uploads/2020/10/9067465457e4814c3ff4456aa44508bd-768x513.jpg',
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
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.no-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        }
      })
    },
  ],
}