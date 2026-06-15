import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        medelite: "#0f766e",
        infinite: "#1d4ed8",
      },
    },
  },
  plugins: [],
};

export default config;
