# 📊 App Contabilidad

Una aplicación web moderna para la gestión de proyectos, tareas y contabilidad de múltiples negocios. Construida con **SvelteKit**, **Supabase** y **TailwindCSS**.

## ✨ Características

### 🚀 Gestión de Proyectos
- ✅ Crear y organizar proyectos con colores personalizados
- ✅ Sistema de tareas estilo Kanban con drag & drop
- ✅ Estados de tareas: Por hacer, En progreso, En revisión, Completada, Pausada
- ✅ Prioridades: Baja, Media, Alta, Urgente
- ✅ Fechas límite y seguimiento de progreso

### 💰 Contabilidad de Negocios
- ✅ Gestión de múltiples negocios
- ✅ Registro de ingresos y gastos por categorías
- ✅ Métodos de pago múltiples
- ✅ Dashboard financiero con gráficos
- ✅ Reportes y estadísticas en tiempo real

### 🔐 Autenticación y Seguridad
- ✅ Autenticación con Supabase Auth
- ✅ Seguridad a nivel de fila (RLS)
- ✅ Sesiones persistentes
- ✅ Protección de rutas privadas

### 🎨 Interfaz Moderna
- ✅ Diseño responsive (móvil y escritorio)
- ✅ Modo oscuro/claro
- ✅ Componentes reutilizables
- ✅ Animaciones fluidas
- ✅ Iconos con Lucide

## 🛠️ Tecnologías

- **Frontend**: SvelteKit + TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Estilos**: TailwindCSS
- **Gráficos**: Chart.js
- **Validaciones**: Zod
- **Fechas**: date-fns
- **Iconos**: Lucide
- **Drag & Drop**: svelte-dnd-action

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
\`\`\`bash
git clone <url-del-repositorio>
cd app-contabilidad
\`\`\`

### 2. Instalar dependencias
\`\`\`bash
npm install
\`\`\`

### 3. Configurar Supabase

#### 3.1 Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Copia la URL y la clave anónima

#### 3.2 Configurar variables de entorno
\`\`\`bash
cp .env.example .env
\`\`\`

Edita el archivo \`.env\` con tus credenciales:
\`\`\`env
PUBLIC_SUPABASE_URL=tu_url_de_supabase
PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
\`\`\`

#### 3.3 Ejecutar esquema de base de datos
1. Ve al Editor SQL de Supabase
2. Ejecuta el contenido del archivo \`esquema-supabase.sql\`
3. Esto creará todas las tablas, políticas RLS y funciones necesarias

#### 3.4 Configurar autenticación
1. En Supabase Dashboard → Authentication → Settings
2. Desactiva "Enable email confirmations" (para testing)
3. Configura los providers de autenticación que desees

### 4. Generar tipos de Supabase (opcional)
\`\`\`bash
npm run supabase:types
\`\`\`

### 5. Ejecutar la aplicación
\`\`\`bash
npm run dev
\`\`\`

La aplicación estará disponible en \`http://localhost:5173\`

## 📁 Estructura del Proyecto

\`\`\`
src/
├── lib/
│   ├── componentes/
│   │   ├── ui/              # Componentes base (Botón, Input, Modal, etc.)
│   │   ├── proyectos/       # Componentes específicos de proyectos
│   │   ├── finanzas/        # Componentes financieros
│   │   └── navegacion/      # Navegación y breadcrumbs
│   ├── stores/
│   │   ├── auth.ts          # Estado de autenticación
│   │   ├── proyectos.ts     # Estado de proyectos y tareas
│   │   └── finanzas.ts      # Estado financiero
│   ├── supabase/
│   │   └── cliente.ts       # Cliente de Supabase configurado
│   ├── utils/
│   │   ├── formato-fecha.ts # Utilidades de fechas
│   │   ├── formato-moneda.ts# Formateo de monedas
│   │   └── validaciones.ts  # Esquemas de validación con Zod
│   └── tipos/
│       ├── app.ts           # Interfaces TypeScript de la app
│       └── supabase.ts      # Tipos generados de Supabase
├── routes/
│   ├── iniciar-sesion/      # Página de login
│   ├── registrarse/         # Página de registro
│   └── panel/               # Dashboard protegido
│       ├── +layout.svelte   # Layout del dashboard
│       ├── +page.svelte     # Dashboard principal
│       ├── proyectos/       # Módulo de proyectos
│       ├── negocios/        # Módulo de negocios
│       ├── finanzas/        # Módulo financiero
│       └── reportes/        # Reportes y estadísticas
├── app.html                 # Template HTML base
├── app.css                  # Estilos globales con Tailwind
└── app.d.ts                 # Tipos globales de SvelteKit
\`\`\`

## 🗄️ Esquema de Base de Datos

### Tablas Principales

- **proyectos**: Información de proyectos del usuario
- **tareas**: Tareas asociadas a proyectos con estados y prioridades
- **negocios**: Diferentes negocios del usuario
- **movimientos_financieros**: Ingresos y gastos por negocio
- **categorias**: Categorías de ingresos y gastos

### Características de la BD

- 🔒 **Row Level Security (RLS)** activado en todas las tablas
- 🏗️ **Índices optimizados** para consultas frecuentes
- 🔄 **Triggers automáticos** para timestamps
- 📊 **Vistas** para consultas complejas
- 🎯 **Funciones SQL** para estadísticas del dashboard

## 🎯 Funcionalidades Principales

### Dashboard
- Resumen de proyectos activos y tareas pendientes
- Balance financiero mensual
- Widgets de estadísticas en tiempo real
- Accesos rápidos a funciones frecuentes

### Gestión de Proyectos
- CRUD completo de proyectos
- Sistema Kanban para tareas
- Filtros por estado y prioridad
- Arrastrar y soltar para cambiar estados

### Contabilidad
- Múltiples negocios por usuario
- Categorización de ingresos y gastos
- Gráficos de tendencias financieras
- Reportes por período

## 🚀 Scripts Disponibles

\`\`\`bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build            # Build para producción
npm run preview          # Preview del build

# Calidad de código
npm run check            # Verificar TypeScript
npm run lint             # Linter
npm run format           # Formatear código

# Supabase
npm run supabase:types   # Generar tipos desde Supabase
\`\`\`

## 🎨 Personalización

### Colores del Tema
Los colores se pueden personalizar en \`tailwind.config.js\`:

\`\`\`javascript
colors: {
  primary: { /* Tu paleta de colores */ },
  success: { /* Colores de éxito */ },
  danger: { /* Colores de error */ }
}
\`\`\`

### Componentes UI
Todos los componentes están en \`src/lib/componentes/ui/\` y son completamente reutilizables y personalizables.

## 📱 PWA (Opcional)

Para convertir la app en PWA:

1. Instala \`@vite-pwa/sveltekit\`
2. Configura el plugin en \`vite.config.ts\`
3. Agrega los archivos de manifest y service worker

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (\`git checkout -b feature/nueva-funcionalidad\`)
3. Commit tus cambios (\`git commit -m 'Agregar nueva funcionalidad'\`)
4. Push a la rama (\`git push origin feature/nueva-funcionalidad\`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo \`LICENSE\` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación de [SvelteKit](https://kit.svelte.dev/)
2. Consulta la documentación de [Supabase](https://supabase.com/docs)
3. Abre un issue en el repositorio

## 🎯 Roadmap

### Próximas Funcionalidades
- [ ] Colaboradores en proyectos
- [ ] Notificaciones push
- [ ] Exportación de reportes a PDF
- [ ] Integración con APIs de bancos
- [ ] App móvil con Capacitor
- [ ] Modo offline con sincronización

---

Hecho con ❤️ usando SvelteKit y Supabase 