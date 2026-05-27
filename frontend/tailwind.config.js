/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx,js,jsx}", "./public/index.html"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Spectral', 'serif'],
        sans: ['Figtree', 'ui-sans-serif', 'system-ui'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        app: '#F9F8F6',
        panel: '#FFFFFF',
        ink: {
          900: '#242220',
          700: '#3E3C3A',
          500: '#6B6661',
          400: '#9A958F',
        },
        line: {
          DEFAULT: '#E5E3D8',
          light: '#F0EFEA',
        },
        bubble: '#F0EFEA',
      },
      boxShadow: {
        panel: '0 0 40px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};
