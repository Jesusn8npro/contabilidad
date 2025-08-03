# 📁 **COMPONENTES DE PROYECTOS**

## 🎯 **PROPÓSITO**
Componentes especializados para la gestión completa de proyectos y tareas con funcionalidad Kanban.

## 📦 **COMPONENTES DISPONIBLES**

### **📋 ListaProyectos.svelte**
Lista principal de proyectos con filtros avanzados.

**Props:**
- `proyectos: Proyecto[]` - Array de proyectos
- `cargando: boolean` - Estado de carga
- `filtro: string` - Filtro de búsqueda
- `vista: 'grid' | 'lista'` - Tipo de vista

**Eventos:**
- `on:crear` - Crear nuevo proyecto  
- `on:filtrar` - Cambio en filtros
- `on:cambiarVista` - Cambio de vista

**Ejemplo:**
```svelte
<ListaProyectos 
  {proyectos}
  {cargando}
  vista="grid"
  on:crear={() => modalNuevo = true}
  on:filtrar={actualizarFiltro}
/>
```

---

### **🎴 TarjetaProyecto.svelte**
Tarjeta individual que muestra información del proyecto.

**Props:**
- `proyecto: Proyecto` - Objeto proyecto
- `compacta: boolean = false` - Vista compacta
- `clickeable: boolean = true` - Si es clickeable

**Eventos:**
- `on:click` - Click en la tarjeta
- `on:editar` - Editar proyecto
- `on:eliminar` - Eliminar proyecto
- `on:archivar` - Archivar proyecto

**Estados:**
- Progreso visual de tareas
- Indicadores de prioridad
- Fechas relativas

---

### **📝 FormularioProyecto.svelte**
Formulario completo para crear/editar proyectos.

**Props:**
- `proyecto: Proyecto | null` - Proyecto a editar (null = crear)
- `modal: boolean = false` - Si está en modal
- `guardando: boolean = false` - Estado de guardado

**Eventos:**
- `on:guardar` - Guardar proyecto
- `on:cancelar` - Cancelar edición
- `on:eliminar` - Eliminar proyecto

**Validaciones:**
- Nombre requerido (min 3 caracteres)
- Descripción opcional
- Fechas válidas
- Color válido

---

### **🏹 KanbanTablero.svelte**
Tablero Kanban principal con drag & drop funcional.

**Props:**
- `proyecto: Proyecto` - Proyecto actual
- `tareas: Tarea[]` - Array de tareas
- `cargandoTareas: boolean` - Estado de carga

**Eventos:**
- `on:moverTarea` - Tarea movida entre columnas
- `on:crearTarea` - Crear nueva tarea
- `on:editarTarea` - Editar tarea existente
- `on:eliminarTarea` - Eliminar tarea
- `on:reordenarTareas` - Reordenar tareas

**Funcionalidades:**
- ✅ **Drag & drop** entre columnas
- ✅ **Filtros** por prioridad/asignado/texto
- ✅ **Vista responsive** con scroll horizontal
- ✅ **Estadísticas** en tiempo real
- ✅ **Barra de progreso** del proyecto

---

### **📊 KanbanColumna.svelte**
Columna individual del tablero Kanban con drop zones.

**Props:**
- `estado: EstadoTarea` - Estado de la columna
- `tareas: Tarea[]` - Tareas de esta columna
- `titulo: string` - Título personalizado (opcional)
- `color: string` - Color de la columna
- `maxItems: number | null` - Límite de tareas (opcional)

**Eventos:**
- `on:consider` - Evento de drag considerado
- `on:finalize` - Evento de drag finalizado
- `on:crearTarea` - Crear tarea en esta columna
- `on:editarTarea` - Editar tarea
- `on:eliminarTarea` - Eliminar tarea

**Características:**
- ✅ **Drop zones** visuales dinámicas
- ✅ **Contador** de tareas con límites opcionales
- ✅ **Estado vacío** elegante
- ✅ **Scroll personalizado** para muchas tareas
- ✅ **Animaciones** fluidas con `flip`

---

### **🎫 TarjetaTarea.svelte**
Tarjeta de tarea individual draggable con diseño premium.

**Props:**
- `tarea: Tarea` - Objeto tarea
- `draggable: boolean = true` - Si es draggable
- `compacta: boolean = false` - Vista compacta
- `isDragging: boolean = false` - Estado de arrastre

**Eventos:**
- `on:click` - Click en tarea
- `on:editar` - Editar tarea
- `on:eliminar` - Eliminar tarea
- `on:cambiarPrioridad` - Cambiar prioridad

**Elementos visuales:**
- ✅ **Prioridad** con colores y borde izquierdo
- ✅ **Fechas límite** con indicadores de urgencia
- ✅ **Asignados** con avatars circulares
- ✅ **Metadatos** (comentarios, adjuntos)
- ✅ **Efectos** de hover y drag
- ✅ **Estados** visuales dinámicos

## 🎨 **SISTEMA DE COLORES**

### **Estados de Tareas:**
```css
.estado-por-hacer { @apply bg-gray-50 dark:bg-gray-800 }
.estado-en-progreso { @apply bg-blue-50 dark:bg-blue-900/20 }
.estado-en-revision { @apply bg-yellow-50 dark:bg-yellow-900/20 }
.estado-completada { @apply bg-green-50 dark:bg-green-900/20 }
.estado-pausada { @apply bg-red-50 dark:bg-red-900/20 }
```

### **Prioridades de Tareas:**
```css
.prioridad-baja { @apply border-l-4 border-gray-400 }
.prioridad-media { @apply border-l-4 border-blue-400 }
.prioridad-alta { @apply border-l-4 border-orange-400 }
.prioridad-urgente { @apply border-l-4 border-red-400 }
```

### **Fechas Límite:**
- **Vencida**: Rojo (`text-red-600 bg-red-50`)
- **Próxima** (3 días): Naranja (`text-orange-600 bg-orange-50`)
- **Normal**: Gris (`text-gray-600 bg-gray-50`)

## 🔄 **FLUJO DE DATOS KANBAN**

```
KanbanTablero
    ├── Filtros y estadísticas
    ├── KanbanColumna (x4)
    │   ├── Drop zone con dndzone
    │   ├── TarjetaTarea (draggable)
    │   └── Estado vacío
    └── Footer con resumen
```

## 🚀 **DRAG & DROP**

Usando **`svelte-dnd-action`** para funcionalidad completa:

```typescript
// Mover entre columnas
on:finalize={(e) => {
  if (info.source !== info.target) {
    dispatch('moverTarea', {
      tareaId: tarea.id,
      nuevoEstado: estadoColumna,
      nuevoOrden: nuevaPosicion
    });
  }
}}

// Reordenar dentro de columna
dispatch('reordenarTareas', { 
  tareas: tareasReordenadas 
});
```

## 📱 **RESPONSIVE DESIGN**

- **Desktop**: 4 columnas visibles con scroll horizontal
- **Tablet**: 3 columnas con scroll
- **Mobile**: 1-2 columnas con navegación por tabs

## ⚡ **PERFORMANCE**

- **Virtual scrolling** para muchas tareas
- **Lazy loading** de componentes pesados
- **Debounced filters** para búsqueda
- **Optimistic updates** en drag & drop
- **Animaciones** con `flip` y `dndzone`

## 🔗 **INTEGRACIÓN**

Todos los componentes están integrados con:
- **Store de proyectos** (`$proyectos`, `$tareasProyectoActual`)
- **Store de auth** (`$user`)
- **Supabase** para persistencia en tiempo real
- **SvelteKit** para navegación fluida

## 📋 **PÁGINAS RELACIONADAS**

- `/panel/proyectos` - Lista de proyectos
- `/panel/proyectos/[id]` - Detalle con Kanban
- `/panel/proyectos/nuevo` - Crear proyecto

---
*Última actualización: Diciembre 2024 - Kanban Premium Funcional* 🚀 