/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './app/**/*.{js,ts,jsx,tsx,mdx}', // Note the addition of the `app` directory.
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      // packages content
      '../../packages/**/*.{js,ts,jx,tsx}',
      // Or if using `src` directory:
      './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        colors: {
          background: "var(--background)",
          foreground: "var(--foreground)",
        },
        // screens :{
        //   ssm : "320px",
        //   mod : "375px",
        //   ml: "425px",
        // }
      },
    },
    plugins: [],
}