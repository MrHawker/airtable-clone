import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
      },
      colors:{
        'hover-blue': '#254fad',
        'sign-up-button-blue': '#1b61c9',
        'sign-up-button-blue-focus' :'#1a3866',
        'header-color': '#333840',
        'stronger-contact-sale-bg': '#efdddc',
        'icon-color': '#9297a0',
        'slate-signin': '#f2f2f2',
      }
    },
    
    
  },
  plugins: [],
} satisfies Config;
