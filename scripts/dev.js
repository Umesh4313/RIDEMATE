import { spawn } from 'child_process';
import http from 'http';
import net from 'net';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const javaBackendDir = path.resolve(rootDir, 'java-backend');
const mongoDataDir = path.resolve(rootDir, 'data', 'mongodb');

function checkTcpPort(port, host = '127.0.0.1', timeout = 1200) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeout);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

function checkBackendHealthy() {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:8085/api/v1/mongo/status', (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => {
      const fallbackReq = http.get('http://127.0.0.1:8085/api/health', (fallbackRes) => {
        resolve(fallbackRes.statusCode === 200);
      });
      fallbackReq.on('error', () => resolve(false));
      fallbackReq.setTimeout(1200, () => {
        fallbackReq.destroy();
        resolve(false);
      });
    });
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function findMongodExe() {
  const commonPaths = [
    'C:\\Program Files\\MongoDB\\Server\\8.3\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongod.exe'
  ];

  for (const p of commonPaths) {
    if (fs.existsSync(p)) return p;
  }
  return 'mongod';
}

async function start() {
  console.log('\x1b[36m%s\x1b[0m', '=============================================================');
  console.log('\x1b[36m%s\x1b[0m', '   RIDEMATE: Enterprise Multi-Tier Stack (Mongo + Java + UI)  ');
  console.log('\x1b[36m%s\x1b[0m', '=============================================================');

  let mongoProc = null;
  let javaProc = null;

  // 1. Check & Launch MongoDB
  const isMongoRunning = await checkTcpPort(27017);
  if (isMongoRunning) {
    console.log('\x1b[32m%s\x1b[0m', '[MongoDB] Already running and active on mongodb://localhost:27017/ridemate');
  } else {
    console.log('\x1b[33m%s\x1b[0m', '[MongoDB] Starting mongod daemon on port 27017...');
    if (!fs.existsSync(mongoDataDir)) {
      fs.mkdirSync(mongoDataDir, { recursive: true });
    }

    const mongodExe = findMongodExe();
    mongoProc = spawn(mongodExe, ['--dbpath', mongoDataDir, '--port', '27017', '--bind_ip', '127.0.0.1'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false
    });

    mongoProc.on('error', (err) => {
      console.warn('\x1b[33m%s\x1b[0m', `[MongoDB] Warning: Could not spawn ${mongodExe}: ${err.message}`);
    });

    // Wait up to 5 seconds for Mongo port
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 500));
      if (await checkTcpPort(27017)) {
        console.log('\x1b[32m%s\x1b[0m', '[MongoDB] Successfully started on port 27017');
        break;
      }
    }
  }

  // 2. Check & Launch Java Spring Boot Backend
  const isHealthy = await checkBackendHealthy();
  if (isHealthy) {
    console.log('\x1b[32m%s\x1b[0m', '[Java Backend] Already active & healthy on http://localhost:8085');
    console.log('\x1b[32m%s\x1b[0m', '[Swagger Docs] http://localhost:8085/swagger-ui/index.html');
  } else {
    console.log('\x1b[33m%s\x1b[0m', '[Java Backend] Starting Spring Boot (JPA + Mongo) via Maven on port 8085...');
    javaProc = spawn('mvn', ['spring-boot:run'], {
      cwd: javaBackendDir,
      stdio: 'inherit',
      shell: true,
    });

    javaProc.on('error', (err) => {
      console.error('\x1b[31m%s\x1b[0m', '[Java Backend] Error launching:', err);
    });

    // Poll for backend readiness
    console.log('\x1b[36m%s\x1b[0m', '[Java Backend] Waiting for Spring Boot & MongoDB to initialize...');
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      if (await checkBackendHealthy()) {
        console.log('\x1b[32m%s\x1b[0m', '[Java Backend] Spring Boot is READY and listening on http://localhost:8085');
        console.log('\x1b[32m%s\x1b[0m', '[Swagger Docs] http://localhost:8085/swagger-ui/index.html');
        break;
      }
    }
  }

  // 3. Launch Vite Frontend
  console.log('\x1b[34m%s\x1b[0m', '[Frontend] Starting Vite Dev Server on http://localhost:5173...');
  const viteProc = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5173'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true,
  });

  const cleanup = () => {
    console.log('\nShutting down enterprise services...');
    if (javaProc) {
      try { javaProc.kill(); } catch (e) {}
    }
    if (mongoProc) {
      try { mongoProc.kill(); } catch (e) {}
    }
    try { viteProc.kill(); } catch (e) {}
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

start();
