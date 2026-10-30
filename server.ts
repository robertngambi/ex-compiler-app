import express from 'express';
import { createServer as createViteServer } from 'vite';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

const isProduction = process.env.NODE_ENV === 'production';
const PORT = 3000;

async function startServer() {
  const app = express();

  // Support large uploads (e.g. project archives, custom icons)
  app.use(express.json({ limit: '60mb' }));
  app.use(express.urlencoded({ extended: true, limit: '60mb' }));

  // API Route: Real Native Android APK Compilation
  app.post('/api/build/apk', async (req, res) => {
    try {
      const {
        projectName = 'Application',
        packageId = 'app.excompiler.app',
        buildProfile = 'release',
        customIconBase64,
        assetsFiles = {},
      } = req.body;

      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'apk-build-'));
      const outputPath = path.join(tmpDir, `${projectName.toLowerCase()}-${buildProfile}.apk`);

      const payload = JSON.stringify({
        outputPath,
        projectName,
        packageId,
        buildProfile,
        customIconBase64,
        assetsFiles,
      });

      const scriptPath = path.resolve('scripts/build_apk.py');

      const proc = spawn('python3', [scriptPath, '--json']);
      let stderr = '';

      proc.stdin.write(payload);
      proc.stdin.end();

      proc.stderr.on('data', (d) => {
        stderr += d.toString();
      });

      proc.on('close', (code) => {
        if (code !== 0 || !fs.existsSync(outputPath)) {
          console.error('APK build script failed:', stderr);
          try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
          return res.status(500).json({ error: 'Failed to compile real APK', details: stderr });
        }

        const apkBuffer = fs.readFileSync(outputPath);
        try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}

        res.setHeader('Content-Type', 'application/vnd.android.package-archive');
        res.setHeader('Content-Disposition', `attachment; filename="${path.basename(outputPath)}"`);
        res.setHeader('Content-Length', apkBuffer.length);
        return res.send(apkBuffer);
      });
    } catch (err: any) {
      console.error('API /api/build/apk error:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', engine: 'Ex-Compiler Native Toolchain v1.0' });
  });

  // Vite middleware in development
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve('dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ex-Compiler Build Engine running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
