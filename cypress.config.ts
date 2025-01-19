import { defineConfig } from "cypress"

export default defineConfig({
  e2e: {
    specPattern: ["./src/**/*.spec.js"],
    supportFile: false,
  },
})
