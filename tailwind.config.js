/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Text"',
          '"SF Pro Display"',
          '"Helvetica Neue"',
          "sans-serif",
        ],
      },
      colors: {
        apple: {
          bg: "#F5F5F7",
          card: "#FFFFFF",
          text: "#1D1D1F",
          secondary: "#86868B",
          tertiary: "#6E6E73",
          border: "#D2D2D7",
          'border-light': "#E5E5EA",
          blue: {
            DEFAULT: "#0071E3",
            hover: "#0077ED",
            light: "#E8F0FE",
            dark: "#005bb5",
          },
          green: "#34C759",
          red: "#FF3B30",
          orange: "#FF9500",
        },
      },
      boxShadow: {
        'apple-sm': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'apple-card': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'apple-hover': '0 12px 32px rgba(0, 0, 0, 0.08)',
        'apple-modal': '0 20px 40px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        'apple': '18px',
        'apple-sm': '12px',
        'apple-lg': '24px',
      },
      backdropBlur: {
        'apple': '20px',
      },
    },
  },
  plugins: [],
};
