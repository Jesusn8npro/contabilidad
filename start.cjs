#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando servidor de producción...');
console.log('📂 Directorio actual:', process.cwd());
console.log('📝 Variables de entorno relevantes:');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   PORT:', process.env.PORT);

// Verificar que el directorio build existe
const buildPath = path.join(process.cwd(), 'build');
console.log('🔍 Verificando build en:', buildPath);

try {
    require('fs').accessSync(buildPath);
    console.log('✅ Directorio build encontrado');
} catch (error) {
    console.error('❌ Error: No se encontró el directorio build');
    console.error('   Asegúrate de que npm run build se ejecutó correctamente');
    process.exit(1);
}

// Iniciar el servidor
const serverProcess = spawn('node', ['build'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000
    }
});

serverProcess.on('error', (error) => {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
});

serverProcess.on('exit', (code) => {
    console.log(`🏁 Servidor terminó con código: ${code}`);
    process.exit(code);
}); 