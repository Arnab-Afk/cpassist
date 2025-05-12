/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        'secondary-background': 'var(--color-secondary-background)',
        foreground: 'var(--color-foreground)',
        main: 'var(--color-main)',
        'main-foreground': 'var(--color-main-foreground)',
        border: 'var(--color-border)',
        ring: 'var(--color-ring)',
        overlay: 'var(--color-overlay)',
      },
      boxShadow: {
        shadow: 'var(--shadow)',
      },
      borderRadius: {
        base: '4px',
        'xl-base': '8px',
      },
    },
  },
  plugins: [],
}
