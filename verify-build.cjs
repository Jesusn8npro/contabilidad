#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración del proyecto...\n');

// Verificar package.json
console.log('📦 Verificando package.json...');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log('✅ package.json válido');
    console.log('   Nombre:', packageJson.name);
    console.log('   Versión:', packageJson.version);
    console.log('   Scripts disponibles:', Object.keys(packageJson.scripts).join(', '));
} catch (error) {
    console.error('❌ Error leyendo package.json:', error.message);
}

// Verificar node_modules
console.log('\n📚 Verificando node_modules...');
if (fs.existsSync('node_modules')) {
    console.log('✅ node_modules encontrado');
    const packageCount = fs.readdirSync('node_modules').length;
    console.log(`   Paquetes instalados: ${packageCount}`);
} else {
    console.log('❌ node_modules no encontrado');
}

// Verificar build
console.log('\n🏗️ Verificando directorio build...');
if (fs.existsSync('build')) {
    console.log('✅ Directorio build encontrado');
    const buildFiles = fs.readdirSync('build');
    console.log(`   Archivos en build: ${buildFiles.length}`);
    console.log('   Archivos principales:', buildFiles.slice(0, 5).join(', '));
} else {
    console.log('❌ Directorio build no encontrado');
}

// Verificar .svelte-kit
console.log('\n🔧 Verificando .svelte-kit...');
if (fs.existsSync('.svelte-kit')) {
    console.log('✅ .svelte-kit encontrado');
} else {
    console.log('❌ .svelte-kit no encontrado');
}

// Información del sistema
console.log('\n💻 Información del sistema:');
console.log('   Node.js:', process.version);
console.log('   Platform:', process.platform);
console.log('   Arch:', process.arch);
console.log('   PWD:', process.cwd());

console.log('\n🎯 Estado del proyecto:');
const isReady = fs.existsSync('build') && fs.existsSync('node_modules');
console.log(`   Listo para deploy: ${isReady ? '✅ SÍ' : '❌ NO'}`);

if (!isReady) {
    console.log('\n🚨 Pasos requeridos antes del deploy:');
    if (!fs.existsSync('node_modules')) {
        console.log('   1. Ejecutar: npm install');
    }
    if (!fs.existsSync('build')) {
        console.log('   2. Ejecutar: npm run build');
    }
} 