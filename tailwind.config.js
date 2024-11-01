/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Light mode colors
        light: {
          bg: '#ffffff',
          card: '#f3f4f6',
          text: '#1f2937',
          'text-secondary': '#4b5563',
          border: '#e5e7eb',
          hover: '#f9fafb'
        },
        // Dark mode colors
        dark: {
          bg: '#111827',
          card: '#1f2937',
          text: '#f9fafb',
          'text-secondary': '#9ca3af',
          border: '#374151',
          hover: '#374151'
        }
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}