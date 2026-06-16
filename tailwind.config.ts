import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        medelite: "#0f766e",
        infinite: "#1d4ed8",
        surface: "#f6f8fc",
        line: "#d8e0ea",
        muted: "#5b677a",
      },
      boxShadow: {
        soft: "0 18px 45px rgba(23, 32, 51, 0.08)",
        card: "0 10px 28px rgba(23, 32, 51, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
