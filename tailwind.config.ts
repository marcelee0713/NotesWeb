import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        default: "5px",
        buttons: "15px",
      },
      boxShadow: {
        default: "0 5px 15px 0 #000",
        shadowDefault: "0 0 5px 5px #000",
        navBarShadow: "0 0 15px 5px #000",
      },
    },
  },
  plugins: [],
};
export default config;
