// Este archivo inicia el servidor MCP de Brave
console.log('Iniciando servidor MCP de Brave...');

// Importar y ejecutar el servidor
const { spawn } = require('child_process');

const server = spawn('npx', ['@modelcontextprotocol/server-brave-search'], {
  stdio: 'inherit',
  env: process.env
});

server.on('close', (code) => {
  console.log(`Servidor terminó con código ${code}`);
});

server.on('error', (error) => {
  console.error('Error del servidor:', error);
});
