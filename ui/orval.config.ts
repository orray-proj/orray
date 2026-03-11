import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: "../api/swagger.json",
    output: {
      target: "./src/generated/api.ts",
      schemas: "./src/generated/models",
      mode: "single",
      client: "react-query",
      baseUrl: { getBaseUrlFromSpecification: false, baseUrl: "/api" },
      override: {
        mutator: {
          path: "./src/lib/fetcher.ts",
          name: "fetcher",
        },
      },
    },
  },
});
