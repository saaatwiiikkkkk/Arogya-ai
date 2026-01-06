import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { spawn } from "child_process";
import http from "http";

const FASTAPI_PORT = 8000;

let fastapiProcess: ReturnType<typeof spawn> | null = null;

function startFastAPI() {
  if (fastapiProcess) return;
  
  console.log("Starting FastAPI backend on port", FASTAPI_PORT);
  
  fastapiProcess = spawn("python", ["-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", FASTAPI_PORT.toString()], {
    cwd: "./backend",
    env: { ...process.env, PORT: FASTAPI_PORT.toString() },
    stdio: ["ignore", "pipe", "pipe"]
  });
  
  fastapiProcess.stdout?.on("data", (data) => {
    console.log(`[FastAPI] ${data.toString().trim()}`);
  });
  
  fastapiProcess.stderr?.on("data", (data) => {
    console.log(`[FastAPI] ${data.toString().trim()}`);
  });
  
  fastapiProcess.on("error", (error) => {
    console.error("Failed to start FastAPI:", error);
  });
  
  fastapiProcess.on("exit", (code) => {
    console.log(`FastAPI process exited with code ${code}`);
    fastapiProcess = null;
  });
}

function proxyToFastAPI(req: Request, res: Response) {
  const options = {
    hostname: '127.0.0.1',
    port: FASTAPI_PORT,
    path: req.originalUrl,
    method: req.method,
    headers: {
      ...req.headers,
      host: `127.0.0.1:${FASTAPI_PORT}`
    }
  };
  
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
    proxyRes.pipe(res);
  });
  
  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Backend service unavailable' });
    }
  });
  
  if (req.rawBody) {
    proxyReq.write(req.rawBody);
    proxyReq.end();
  } else {
    req.pipe(proxyReq, { end: true });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  startFastAPI();
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  app.use("/api", proxyToFastAPI);
  app.use("/patients", proxyToFastAPI);
  app.use("/safety", proxyToFastAPI);
  app.use("/files", proxyToFastAPI);
  app.get("/health", proxyToFastAPI);

  return httpServer;
}
