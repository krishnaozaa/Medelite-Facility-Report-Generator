import { fileURLToPath } from "node:url";
import { transformWithOxc } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    {
      name: "vitest-tsx-jsx-transform",
      enforce: "pre",
      async transform(code, id) {
        if (!id.endsWith(".tsx")) {
          return null;
        }

        const options = {
          lang: "tsx",
          jsx: "react-jsx",
          jsxImportSource: "react",
        } as never;

        return transformWithOxc(code, id, options);
      },
    },
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
