# 🚀 Guía de Deploy - Easypanel + Nixpacks

## 📋 Configuraciones Disponibles

### 1. 🎯 Configuración Principal (nixpacks.toml)
```toml
[variables]
NODE_VERSION = "18"
NPM_CONFIG_UPDATE_NOTIFIER = "false"
NPM_CONFIG_FUND = "false"
NIXPACKS_PATH = "/app/node_modules/.bin:$PATH"

[phases.setup]
nixPkgs = ["nodejs-18_x", "npm"]

[phases.install]
cmds = [
    "npm ci --no-audit --no-fund --prefer-offline",
    "npm run build"
]

[phases.build]
cmds = ["echo 'Build completed successfully'"]

[start]
cmd = "node build"
```

### 2. 🔄 Configuración Alternativa (nixpacks.simple.toml)
Si la principal falla, renombrar este archivo a `nixpacks.toml`:
```toml
[variables]
NODE_VERSION = "18"

[phases.setup]
nixPkgs = ["nodejs-18_x"]

[phases.install]
cmds = ["npm install", "npm run build"]

[start]
cmd = "npm start"
```

## 🛠️ Variables de Entorno Requeridas

En Easypanel, configurar estas variables:

```bash
NODE_ENV=production
PORT=3000
PUBLIC_SUPABASE_URL=tu_url_de_supabase
PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
```

## 🐛 Debugging

Si el deploy falla:

1. **Verificar logs del build**:
   - Buscar errores de npm install
   - Verificar que npm run build complete exitosamente

2. **Ejecutar verificación local**:
   ```bash
   node verify-build.js
   ```

3. **Probar build local**:
   ```bash
   npm install
   npm run build
   npm start
   ```

## 📁 Archivos Importantes

- `nixpacks.toml` - Configuración principal de Nixpacks
- `nixpacks.simple.toml` - Configuración alternativa
- `start.js` - Script de entrada personalizado
- `verify-build.js` - Script de verificación
- `.nvmrc` - Versión de Node.js

## 🚨 Solución de Problemas Comunes

### Error: `$NIXPACKS_PATH not defined`
- Usar la configuración simple (nixpacks.simple.toml)

### Error: `npm run build failed`
- Verificar errores de TypeScript con `npm run check`
- Asegurar que todas las dependencias están en package.json

### Error: `node build failed`
- Verificar que el directorio build existe
- Usar start.js como punto de entrada alternativo

## ✅ Checklist Pre-Deploy

- [ ] Build local exitoso: `npm run build`
- [ ] Check de tipos exitoso: `npm run check`
- [ ] Variables de entorno configuradas
- [ ] nixpacks.toml presente
- [ ] package.json tiene script "start" 