import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
    root: "frontend",
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            "/api": "http://localhost:3000",
            "/greet.v1.GreetService": "http://localhost:3000",
        },
    },
});
