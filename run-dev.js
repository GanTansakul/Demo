// run-dev.js - สคริปต์รันทั้ง Server และ Client พร้อมกันโดยไม่ต้องพึ่ง concurrently
const { spawn } = require('child_process');
const path = require('path');

console.log('🌾 กำลังเริ่มต้นระบบ HiwKaw (หิวก้าว) มธ.รังสิต...');
console.log('🚀 Backend: Express (Port 5000)');
console.log('⚛️  Frontend: React Vite (Port 3000)');

// 1. รัน Backend Express Server
const server = spawn('node', ['server/index.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

// 2. รัน Frontend Vite Dev Server
const client = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true
});

server.on('error', (err) => console.error('Server error:', err));
client.on('error', (err) => console.error('Client error:', err));

const cleanup = () => {
  try { server.kill(); } catch (e) {}
  try { client.kill(); } catch (e) {}
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
