import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    try {
      const vite = await import("vite");
      const viteServer = await vite.createServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(viteServer.middlewares);
      
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    } catch (error) {
      console.log("Skipping Vite in production environment.");
    }
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

startServer();

export default app;
