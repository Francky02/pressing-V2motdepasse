import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('\n======================================================');
console.log('🚀 Démarrage conjoint de Relancio (SaaS)');
console.log('   - Backend API : http://localhost:5000');
console.log('   - Frontend UI : http://localhost:5173');
console.log('======================================================\n');

// 1. Démarrage du serveur Express
const server = spawn(npmCmd, ['run', 'server'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, FORCE_COLOR: '1' },
});

// 2. Démarrage du client Vite
const client = spawn(npmCmd, ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, FORCE_COLOR: '1' },
});

let isShuttingDown = false;

function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log('\n🛑 Arrêt propre des services Relancio (Backend + Frontend)...');

  if (isWindows) {
    try {
      if (server.pid) spawn('taskkill', ['/pid', server.pid.toString(), '/T', '/F'], { stdio: 'ignore' });
      if (client.pid) spawn('taskkill', ['/pid', client.pid.toString(), '/T', '/F'], { stdio: 'ignore' });
    } catch {
      // Ignore
    }
  } else {
    try {
      server.kill('SIGTERM');
      client.kill('SIGTERM');
    } catch {
      // Ignore
    }
  }

  setTimeout(() => {
    process.exit(0);
  }, 500);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('SIGHUP', shutdown);

server.on('exit', (code) => {
  if (!isShuttingDown && code !== 0 && code !== null) {
    console.error(`[Server] Le serveur s'est arrêté avec le code ${code}`);
    shutdown();
  }
});

client.on('exit', (code) => {
  if (!isShuttingDown && code !== 0 && code !== null) {
    console.error(`[Client] Le client Vite s'est arrêté avec le code ${code}`);
    shutdown();
  }
});
