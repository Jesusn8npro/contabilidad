# 📚 **COMPONENTES - APP CONTABILIDAD**

## 🏗️ **ESTRUCTURA ORGANIZADA**

```
src/lib/componentes/
├── ui/                     # Componentes base reutilizables
│   ├── Boton.svelte       # Botón con variantes y estados
│   ├── Input.svelte       # Input con validación y tipos
│   ├── Modal.svelte       # Modal responsive y accesible
│   ├── Cargando.svelte    # Spinner de carga personalizable
│   ├── Tarjeta.svelte     # Card component con efectos
│   └── BotonTema.svelte   # Toggle dark/light mode
├── proyectos/             # Componentes específicos de proyectos
│   ├── ListaProyectos.svelte          # Lista con filtros y búsqueda
│   ├── TarjetaProyecto.svelte         # Card individual de proyecto
│   ├── FormularioProyecto.svelte      # Crear/editar proyecto
│   ├── KanbanTablero.svelte           # Tablero Kanban principal
│   ├── KanbanColumna.svelte           # Columna del Kanban
│   └── TarjetaTarea.svelte            # Tarjeta de tarea draggable
├── finanzas/              # Componentes financieros
│   ├── ListaMovimientos.svelte        # Lista de transacciones
│   ├── FormularioMovimiento.svelte    # Crear ingreso/gasto
│   ├── GraficoLineas.svelte           # Gráfico de tendencias
│   ├── GraficoDonut.svelte            # Gráfico circular
│   └── ResumenFinanciero.svelte       # Widget de resumen
├── negocios/              # Componentes de negocios
│   ├── ListaNegocios.svelte           # Lista de empresas
│   ├── TarjetaNegocio.svelte          # Card de negocio
│   └── FormularioNegocio.svelte       # Crear/editar negocio
└── layout/                # Componentes de layout
    ├── Sidebar.svelte                 # Barra lateral de navegación
    ├── Header.svelte                  # Header con usuario y acciones
    └── Breadcrumb.svelte              # Navegación breadcrumb
```

## 🎯 **CONVENCIONES**

### **📝 Nomenclatura:**
- **PascalCase** para nombres de componentes
- **camelCase** para props y variables
- **kebab-case** para clases CSS personalizadas

### **🔧 Props Estándar:**
- `class` - Clases CSS adicionales
- `loading` - Estado de carga
- `disabled` - Estado deshabilitado
- `error` - Mensaje de error
- `size` - Tamaño (sm, md, lg, xl)

### **🎨 Estilos:**
- Usar **TailwindCSS** como base
- **Dark mode** compatible (`dark:`)
- **Responsive** por defecto
- **Transiciones** suaves en hover/focus

### **⚡ Performance:**
- **Lazy loading** para componentes pesados
- **Svelte stores** para estado compartido
- **Minimal re-renders** usando `$:` reactive statements

## 📖 **DOCUMENTACIÓN**

Cada carpeta contiene su propio `README.md` con:
- Descripción de componentes
- Props disponibles
- Ejemplos de uso
- Estados y variantes

## 🔄 **ESTADO GLOBAL**

Los componentes usan estos stores:
- `$auth` - Usuario y autenticación
- `$proyectos` - Estado de proyectos y tareas
- `$finanzas` - Movimientos y estadísticas
- `$temaActual` - Tema oscuro/claro

## 🚀 **EJEMPLO DE USO**

```svelte
<script>
  import Boton from '$lib/componentes/ui/Boton.svelte';
  import TarjetaProyecto from '$lib/componentes/proyectos/TarjetaProyecto.svelte';
</script>

<TarjetaProyecto 
  proyecto={miProyecto} 
  on:editar={handleEditar}
  on:eliminar={handleEliminar}
/>

<Boton 
  variante="primary" 
  size="lg"
  loading={guardando}
  on:click={guardar}
>
  Guardar Proyecto
</Boton>
```

---
*Actualizado: Diciembre 2024 - Versión Premium* 