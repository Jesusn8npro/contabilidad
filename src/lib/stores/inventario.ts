import { writable, derived } from 'svelte/store';
import type { 
    Producto, 
    CategoriaProducto, 
    MovimientoInventario, 
    EstadisticasInventario,
    ProductoStockBajo 
} from '$lib/tipos/clientes-inventario';
import { supabase } from '$lib/supabase/cliente';
import { mostrarError, mostrarExito } from './toast';

// Estados principales
export const productos = writable<Producto[]>([]);
export const categoriasProductos = writable<CategoriaProducto[]>([]);
export const movimientosInventario = writable<MovimientoInventario[]>([]);
export const productoActual = writable<Producto | null>(null);
export const cargandoProductos = writable<boolean>(false);
export const cargandoMovimientos = writable<boolean>(false);

// Estados derivados
export const estadisticasInventario = derived([productos], ([$productos]) => {
    const estadisticas: EstadisticasInventario = {
        total_productos: $productos.length,
        productos_activos: $productos.filter(p => p.estado === 'activo').length,
        valor_total_inventario: $productos.reduce((sum, p) => sum + (p.precio_venta * p.stock_actual), 0),
        productos_stock_bajo: $productos.filter(p => p.stock_actual <= p.stock_minimo && p.estado === 'activo').length,
        productos_sin_stock: $productos.filter(p => p.stock_actual <= 0 && p.estado === 'activo').length,
        rotacion_promedio: $productos.length > 0 
            ? $productos.reduce((sum, p) => sum + p.rotacion_inventario, 0) / $productos.length 
            : 0
    };
    
    return estadisticas;
});

// Productos con stock bajo
export const productosStockBajo = derived([productos], ([$productos]) => {
    return $productos.filter(p => 
        p.stock_actual <= p.stock_minimo && 
        p.estado === 'activo'
    );
});

// Productos por categoría
export const productosPorCategoria = derived([productos, categoriasProductos], ([$productos, $categorias]) => {
    const porCategoria = $productos.reduce((acc, producto) => {
        const categoriaId = producto.categoria_producto_id || 'sin_categoria';
        const categoria = $categorias.find(c => c.id === categoriaId);
        const nombreCategoria = categoria?.nombre || 'Sin Categoría';
        
        if (!acc[nombreCategoria]) {
            acc[nombreCategoria] = [];
        }
        acc[nombreCategoria].push(producto);
        return acc;
    }, {} as Record<string, Producto[]>);
    
    return porCategoria;
});

// Valor del inventario por categoría
export const valorInventarioPorCategoria = derived([productos, categoriasProductos], ([$productos, $categorias]) => {
    const valorPorCategoria = $productos.reduce((acc, producto) => {
        const categoriaId = producto.categoria_producto_id || 'sin_categoria';
        const categoria = $categorias.find(c => c.id === categoriaId);
        const nombreCategoria = categoria?.nombre || 'Sin Categoría';
        
        const valor = producto.precio_venta * producto.stock_actual;
        
        if (!acc[nombreCategoria]) {
            acc[nombreCategoria] = 0;
        }
        acc[nombreCategoria] += valor;
        return acc;
    }, {} as Record<string, number>);
    
    return valorPorCategoria;
});

// ==================== FUNCIONES CATEGORÍAS ====================

// Cargar categorías de productos
export const cargarCategoriasProductos = async (negocioId?: string): Promise<void> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            mostrarError('No hay usuario autenticado');
            return;
        }

        let query = supabase
            .from('categorias_productos')
            .select('*')
            .eq('usuario_id', user.id)
            .eq('activa', true);

        if (negocioId) {
            query = query.eq('negocio_id', negocioId);
        }

        const { data, error } = await query.order('nombre', { ascending: true });

        if (error) {
            console.error('Error cargando categorías:', error);
            mostrarError('Error al cargar las categorías');
            return;
        }

        categoriasProductos.set(data || []);
    } catch (error) {
        console.error('Error en cargarCategoriasProductos:', error);
        mostrarError('Error al cargar las categorías');
    }
};

// Crear categoría de producto
export const crearCategoriaProducto = async (categoriaData: Partial<CategoriaProducto>): Promise<CategoriaProducto | null> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            mostrarError('No hay usuario autenticado');
            return null;
        }

        const nuevaCategoria = {
            ...categoriaData,
            usuario_id: user.id,
            fecha_creacion: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('categorias_productos')
            .insert([nuevaCategoria])
            .select()
            .single();

        if (error) {
            console.error('Error creando categoría:', error);
            mostrarError('Error al crear la categoría');
            return null;
        }

        // Actualizar store local
        categoriasProductos.update(lista => [...lista, data]);
        mostrarExito('Categoría creada exitosamente');
        return data;
    } catch (error) {
        console.error('Error en crearCategoriaProducto:', error);
        mostrarError('Error al crear la categoría');
        return null;
    }
};

// ==================== FUNCIONES PRODUCTOS ====================

// Cargar productos
export const cargarProductos = async (negocioId?: string): Promise<void> => {
    try {
        cargandoProductos.set(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            mostrarError('No hay usuario autenticado');
            return;
        }

        let query = supabase
            .from('productos')
            .select(`
                *,
                categoria_producto:categoria_producto_id (
                    id,
                    nombre,
                    color,
                    icono,
                    descripcion
                ),
                proveedor_principal:proveedor_principal_id (
                    id,
                    nombre
                )
            `)
            .eq('usuario_id', user.id);

        if (negocioId) {
            query = query.eq('negocio_id', negocioId);
        }

        const { data, error } = await query.order('fecha_creacion', { ascending: false });

        if (error) {
            console.error('Error cargando productos:', error);
            mostrarError('Error al cargar los productos');
            return;
        }

        productos.set(data || []);
    } catch (error) {
        console.error('Error en cargarProductos:', error);
        mostrarError('Error al cargar los productos');
    } finally {
        cargandoProductos.set(false);
    }
};

// Crear producto
export const crearProducto = async (productoData: Partial<Producto>): Promise<Producto | null> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            mostrarError('No hay usuario autenticado');
            return null;
        }

        const nuevoProducto = {
            ...productoData,
            usuario_id: user.id,
            fecha_creacion: new Date().toISOString(),
            fecha_actualizacion: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('productos')
            .insert([nuevoProducto])
            .select(`
                *,
                categoria_producto:categoria_producto_id (
                    id,
                    nombre,
                    color
                ),
                proveedor_principal:proveedor_principal_id (
                    id,
                    nombre
                )
            `)
            .single();

        if (error) {
            console.error('Error creando producto:', error);
            mostrarError('Error al crear el producto: ' + error.message);
            return null;
        }

        // Actualizar store local
        productos.update(lista => [data, ...lista]);
        mostrarExito('Producto creado exitosamente');
        return data;
    } catch (error) {
        console.error('Error en crearProducto:', error);
        mostrarError('Error al crear el producto');
        return null;
    }
};

// Actualizar producto
export const actualizarProducto = async (id: string, updates: Partial<Producto>): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('productos')
            .update({
                ...updates,
                fecha_actualizacion: new Date().toISOString()
            })
            .eq('id', id);

        if (error) {
            console.error('Error actualizando producto:', error);
            mostrarError('Error al actualizar el producto');
            return false;
        }

        // Actualizar store local
        productos.update(lista => lista.map(p => p.id === id ? { ...p, ...updates } : p));
        
        // Si es el producto actual, actualizarlo también
        productoActual.update(actual => actual?.id === id ? { ...actual, ...updates } : actual);
        
        mostrarExito('Producto actualizado exitosamente');
        return true;
    } catch (error) {
        console.error('Error en actualizarProducto:', error);
        mostrarError('Error al actualizar el producto');
        return false;
    }
};

// Eliminar producto
export const eliminarProducto = async (id: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('productos')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error eliminando producto:', error);
            mostrarError('Error al eliminar el producto');
            return false;
        }

        // Actualizar store local
        productos.update(lista => lista.filter(p => p.id !== id));
        
        // Si es el producto actual, limpiarlo
        productoActual.update(actual => actual?.id === id ? null : actual);
        
        mostrarExito('Producto eliminado exitosamente');
        return true;
    } catch (error) {
        console.error('Error en eliminarProducto:', error);
        mostrarError('Error al eliminar el producto');
        return false;
    }
};

// ==================== FUNCIONES MOVIMIENTOS INVENTARIO ====================

// Cargar movimientos de inventario
export const cargarMovimientosInventario = async (productoId?: string, negocioId?: string): Promise<void> => {
    try {
        cargandoMovimientos.set(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            mostrarError('No hay usuario autenticado');
            return;
        }

        let query = supabase
            .from('movimientos_inventario')
            .select(`
                *,
                producto:producto_id (
                    id,
                    nombre,
                    codigo
                )
            `)
            .eq('usuario_id', user.id);

        if (productoId) {
            query = query.eq('producto_id', productoId);
        }

        if (negocioId) {
            query = query.eq('negocio_id', negocioId);
        }

        const { data, error } = await query.order('fecha_movimiento', { ascending: false });

        if (error) {
            console.error('Error cargando movimientos:', error);
            mostrarError('Error al cargar los movimientos');
            return;
        }

        movimientosInventario.set(data || []);
    } catch (error) {
        console.error('Error en cargarMovimientosInventario:', error);
        mostrarError('Error al cargar los movimientos');
    } finally {
        cargandoMovimientos.set(false);
    }
};

// Crear movimiento de inventario
export const crearMovimientoInventario = async (movimientoData: Partial<MovimientoInventario>): Promise<MovimientoInventario | null> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            mostrarError('No hay usuario autenticado');
            return null;
        }

        const nuevoMovimiento = {
            ...movimientoData,
            usuario_id: user.id,
            fecha_movimiento: movimientoData.fecha_movimiento || new Date().toISOString(),
            fecha_creacion: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('movimientos_inventario')
            .insert([nuevoMovimiento])
            .select(`
                *,
                producto:producto_id (
                    id,
                    nombre,
                    codigo
                )
            `)
            .single();

        if (error) {
            console.error('Error creando movimiento:', error);
            mostrarError('Error al crear el movimiento: ' + error.message);
            return null;
        }

        // Actualizar store local
        movimientosInventario.update(lista => [data, ...lista]);
        mostrarExito('Movimiento de inventario registrado exitosamente');
        
        // Recargar productos para actualizar stocks
        await cargarProductos(movimientoData.negocio_id);
        
        return data;
    } catch (error) {
        console.error('Error en crearMovimientoInventario:', error);
        mostrarError('Error al crear el movimiento');
        return null;
    }
};

// ==================== FUNCIONES DE UTILIDAD ====================

// Buscar productos
export const buscarProductos = async (termino: string, negocioId?: string): Promise<Producto[]> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        let query = supabase
            .from('productos')
            .select(`
                *,
                categoria_producto:categoria_producto_id (
                    id,
                    nombre,
                    color
                )
            `)
            .eq('usuario_id', user.id);

        if (negocioId) {
            query = query.eq('negocio_id', negocioId);
        }

        query = query.or(`nombre.ilike.%${termino}%,codigo.ilike.%${termino}%,codigo_barras.ilike.%${termino}%,marca.ilike.%${termino}%`);

        const { data, error } = await query.order('nombre', { ascending: true });

        if (error) {
            console.error('Error buscando productos:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error en buscarProductos:', error);
        return [];
    }
};

// Obtener productos con stock bajo
export const obtenerProductosStockBajo = async (negocioId?: string): Promise<ProductoStockBajo[]> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        let query = supabase
            .from('vista_productos_stock_bajo')
            .select('*')
            .eq('usuario_id', user.id);

        if (negocioId) {
            query = query.eq('negocio_id', negocioId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error obteniendo productos con stock bajo:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error en obtenerProductosStockBajo:', error);
        return [];
    }
};

// Actualizar stock manualmente
export const actualizarStockManual = async (
    productoId: string, 
    nuevoStock: number, 
    motivo: string = 'Ajuste manual'
): Promise<boolean> => {
    try {
        // Obtener el producto actual
        const { data: producto, error: errorProducto } = await supabase
            .from('productos')
            .select('*')
            .eq('id', productoId)
            .single();

        if (errorProducto || !producto) {
            mostrarError('Error al obtener el producto');
            return false;
        }

        const diferencia = nuevoStock - producto.stock_actual;
        const tipoMovimiento = diferencia > 0 ? 'entrada_ajuste' : 'salida_ajuste';

        // Crear movimiento de inventario
        const movimiento: Partial<MovimientoInventario> = {
            producto_id: productoId,
            negocio_id: producto.negocio_id,
            tipo_movimiento: tipoMovimiento,
            cantidad: Math.abs(diferencia),
            motivo: motivo,
            responsable_movimiento: 'Sistema - Ajuste Manual'
        };

        await crearMovimientoInventario(movimiento);
        return true;
    } catch (error) {
        console.error('Error en actualizarStockManual:', error);
        mostrarError('Error al actualizar el stock');
        return false;
    }
};

// Generar código de producto automático
export const generarCodigoProducto = async (negocioId: string, prefijo: string = 'PROD'): Promise<string> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return `${prefijo}-${Date.now()}`;

        // GENERAR CÓDIGO ÚNICO CON TIMESTAMP + RANDOM
        const timestamp = Date.now().toString().slice(-6); // Últimos 6 dígitos del timestamp
        const random = Math.floor(Math.random() * 999).toString().padStart(3, '0');
        const codigoUnico = `${prefijo}-${timestamp}-${random}`;

        // VERIFICAR QUE NO EXISTA EN LA BASE DE DATOS
        const { data: existente, error } = await supabase
            .from('productos')
            .select('codigo')
            .eq('usuario_id', user.id)
            .eq('codigo', codigoUnico)
            .single();

        // Si existe, generar otro
        if (existente) {
            const nuevoRandom = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
            return `${prefijo}-${timestamp}-${nuevoRandom}`;
        }

        console.log('🎯 Código único generado:', codigoUnico);
        return codigoUnico;

    } catch (error) {
        console.error('Error en generarCodigoProducto:', error);
        // FALLBACK: Código con timestamp completo
        const fallbackCodigo = `${prefijo}-${Date.now()}`;
        console.log('🆘 Usando código fallback:', fallbackCodigo);
        return fallbackCodigo;
    }
};

// Exportar productos a CSV
export const exportarProductosCSV = async (negocioId?: string): Promise<string | null> => {
    try {
        await cargarProductos(negocioId);
        
        let productosParaExportar: Producto[] = [];
        productos.subscribe(p => productosParaExportar = p)();
        
        if (productosParaExportar.length === 0) {
            mostrarError('No hay productos para exportar');
            return null;
        }

        // Crear CSV
        const headers = [
            'Código',
            'Nombre',
            'Descripción',
            'Marca',
            'Categoría',
            'Precio Compra',
            'Precio Venta',
            'Stock Actual',
            'Stock Mínimo',
            'Unidad Medida',
            'Estado',
            'Fecha Creación'
        ];

        const rows = productosParaExportar.map(producto => [
            producto.codigo,
            producto.nombre,
            producto.descripcion || '',
            producto.marca || '',
            producto.categoria_producto?.nombre || '',
            producto.precio_compra.toString(),
            producto.precio_venta.toString(),
            producto.stock_actual.toString(),
            producto.stock_minimo.toString(),
            producto.unidad_medida,
            producto.estado,
            new Date(producto.fecha_creacion).toLocaleDateString()
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        mostrarExito('Productos exportados exitosamente');
        return csvContent;
    } catch (error) {
        console.error('Error exportando productos:', error);
        mostrarError('Error al exportar los productos');
        return null;
    }
}; 