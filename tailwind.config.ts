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
        'card-brown': '#944d37',
        'data-brown': '#7e422f',
        'lower-brown': '#854531',
        'deeper-brown': '#6f3a29',
        'soft-blue': '#d6f2ff',
        'hover-view-blue': '#c7ecfc',
        'header-bg': '#f5f5f5'
      },
      boxShadow: {
        'inner-strong': 'inset 0 1px 1px rgba(0, 0, 0, 0.25)', 
      },
    },
    
    
  },
  plugins: [],
} satisfies Config;
