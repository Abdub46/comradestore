/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#16a34a',
          600: '#15803d',
          700: '#166534',
        },
      },
      fontFamily: {
        sans: ['"Poppins"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      // Every existing rounded-md/lg/xl class site-wide now lands in the
      // 16-20px "premium" range the brief calls for, with zero changes
      // needed in any component file.
      borderRadius: {
        md: '1rem', // 16px - most buttons and inputs already use rounded-md
        lg: '1.125rem', // 18px
        xl: '1.25rem', // 20px - ProductCard and other larger surfaces
      },
      // Softer, more diffuse shadows than Tailwind's defaults - applies
      // automatically everywhere shadow-sm/DEFAULT/md are already used.
      boxShadow: {
        sm: '0 2px 8px -2px rgba(0, 0, 0, 0.06)',
        DEFAULT: '0 4px 16px -4px rgba(0, 0, 0, 0.08)',
        md: '0 6px 20px -4px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};
