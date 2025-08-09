// =====================================================
// 🎯 TIPOS TYPESCRIPT - CLIENTES, PROVEEDORES E INVENTARIO
// =====================================================

// 👥 TIPOS DE CLIENTES
export interface Cliente {
    id: string;
    usuario_id: string;
    negocio_id: string;
    
    // Información básica
    nombre: string;
    email?: string;
    telefono?: string;
    direccion?: string;
    ciudad?: string;
    pais: string;
    codigo_postal?: string;
    
    // Información fiscal
    tipo_documento: TipoDocumento;
    numero_documento: string;
    razon_social?: string;
    nit?: string;
    regimen_fiscal?: string;
    
    // Información comercial
    tipo_cliente: TipoCliente;
    limite_credito: number;
    dias_credito: number;
    descuento_por_defecto: number;
    
    // Estadísticas
    total_facturado: number;
    total_pagado: number;
    saldo_pendiente: number;
    ultima_compra?: string;
    fecha_primera_compra?: string;
    
    // Clasificación
    categoria_cliente: CategoriaCliente;
    puntuacion_credito: number;
    estado: EstadoCliente;
    
    // Información adicional
    notas?: string;
    contacto_preferido: ContactoPreferido;
    dia_pago_preferido?: number;
    metodo_pago_preferido?: string;
    
    // Timestamps
    fecha_creacion: string;
    fecha_actualizacion: string;
}

// 🏭 TIPOS DE PROVEEDORES
export interface Proveedor {
    id: string;
    usuario_id: string;
    negocio_id: string;
    
    // Información básica
    nombre: string;
    email?: string;
    telefono?: string;
    direccion?: string;
    ciudad?: string;
    pais: string;
    codigo_postal?: string;
    website?: string;
    
    // Información fiscal
    tipo_documento: TipoDocumento;
    numero_documento: string;
    razon_social?: string;
    nit?: string;
    regimen_fiscal?: string;
    
    // Información comercial
    tipo_proveedor: TipoProveedor;
    limite_credito_otorgado: number;
    dias_credito_otorgado: number;
    descuento_recibido: number;
    
    // Estadísticas
    total_comprado: number;
    total_pagado_proveedor: number;
    saldo_por_pagar: number;
    ultima_compra_proveedor?: string;
    fecha_primera_compra_proveedor?: string;
    
    // Clasificación
    categoria_proveedor: CategoriaProveedor;
    calificacion: number;
    estado: EstadoProveedor;
    
    // Información de contacto
    persona_contacto?: string;
    email_contacto?: string;
    telefono_contacto?: string;
    cargo_contacto?: string;
    
    // Información adicional
    productos_servicios?: string[];
    tiempo_entrega_promedio?: number;
    metodo_pago_preferido?: string;
    terminos_pago?: string;
    notas?: string;
    
    // Timestamps
    fecha_creacion: string;
    fecha_actualizacion: string;
}

// 📦 TIPOS DE CATEGORÍAS DE PRODUCTOS
export interface CategoriaProducto {
    id: string;
    usuario_id: string;
    negocio_id: string;
    nombre: string;
    descripcion?: string;
    color: string;
    icono?: string;
    categoria_padre_id?: string;
    activa: boolean;
    fecha_creacion: string;
}

// 📦 TIPOS DE PRODUCTOS
export interface Producto {
    id: string;
    usuario_id: string;
    negocio_id: string;
    categoria_producto_id?: string;
    proveedor_principal_id?: string;
    
    // Información básica
    codigo: string;
    codigo_barras?: string;
    nombre: string;
    descripcion?: string;
    marca?: string;
    modelo?: string;
    
    // Precios
    precio_compra: number;
    precio_venta: number;
    precio_mayorista?: number;
    precio_minimo?: number;
    margen_ganancia?: number;
    
    // Inventario
    tipo_producto: TipoProducto;
    stock_actual: number;
    stock_minimo: number;
    stock_maximo?: number;
    punto_reorden?: number;
    
    // Especificaciones
    unidad_medida: UnidadMedida;
    peso?: number;
    dimensiones?: DimensionesProducto;
    
    // Clasificación
    estado: EstadoProducto;
    es_favorito: boolean;
    permite_venta: boolean;
    permite_compra: boolean;
    
    // Multimedia
    imagen_url?: string;
    imagenes_adicionales?: string[];
    
    // Impuestos
    aplica_iva: boolean;
    porcentaje_iva: number;
    codigo_impuesto?: string;
    
    // Información adicional
    ubicacion_almacen?: string;
    numero_serie?: string;
    fecha_vencimiento?: string;
    lote?: string;
    notas?: string;
    
    // Estadísticas
    total_vendido: number;
    total_comprado: number;
    ultima_venta?: string;
    ultima_compra?: string;
    rotacion_inventario: number;
    
    // Timestamps
    fecha_creacion: string;
    fecha_actualizacion: string;
    
    // Relaciones (cuando se incluyen en queries)
    categoria_producto?: CategoriaProducto;
    proveedor_principal?: Proveedor;
}

// 📊 TIPOS DE MOVIMIENTOS DE INVENTARIO
export interface MovimientoInventario {
    id: string;
    usuario_id: string;
    negocio_id: string;
    producto_id: string;
    
    // Información del movimiento
    tipo_movimiento: TipoMovimientoInventario;
    cantidad: number;
    costo_unitario?: number;
    costo_total?: number;
    
    // Referencia
    documento_referencia?: string;
    tipo_documento?: string;
    
    // Información adicional
    motivo?: string;
    observaciones?: string;
    ubicacion_origen?: string;
    ubicacion_destino?: string;
    
    // Responsable
    responsable_movimiento?: string;
    
    // Timestamps
    fecha_movimiento: string;
    fecha_creacion: string;
    
    // Relación (cuando se incluye en queries)
    producto?: Producto;
}

// =====================================================
// 🏷️ TIPOS ENUMERADOS
// =====================================================

export type TipoDocumento = 'cedula' | 'cedula_extranjeria' | 'pasaporte' | 'nit' | 'rut';

export type TipoCliente = 'individual' | 'empresa' | 'gobierno';

export type CategoriaCliente = 'premium' | 'gold' | 'silver' | 'regular' | 'nuevo';

export type EstadoCliente = 'activo' | 'inactivo' | 'suspendido' | 'bloqueado';

export type ContactoPreferido = 'email' | 'telefono' | 'whatsapp' | 'sms';

export type TipoProveedor = 'productos' | 'servicios' | 'mixto';

export type CategoriaProveedor = 'estrategico' | 'preferido' | 'regular' | 'ocasional';

export type EstadoProveedor = 'activo' | 'inactivo' | 'suspendido' | 'bloqueado';

export type TipoProducto = 'fisico' | 'servicio' | 'digital';

export type EstadoProducto = 'activo' | 'inactivo' | 'descontinuado' | 'agotado';

export type UnidadMedida = 'unidad' | 'kg' | 'g' | 'l' | 'ml' | 'm' | 'cm' | 'm2' | 'm3' | 'caja' | 'paquete' | 'docena' | 'par';

export type TipoMovimientoInventario = 
    | 'entrada_compra' | 'entrada_devolucion' | 'entrada_ajuste' | 'entrada_inicial'
    | 'salida_venta' | 'salida_devolucion' | 'salida_ajuste' | 'salida_merma' | 'salida_regalo';

// =====================================================
// 🔧 TIPOS AUXILIARES
// =====================================================

export interface DimensionesProducto {
    largo?: number;
    ancho?: number;
    alto?: number;
}

// Estadísticas de clientes
export interface EstadisticasCliente {
    total_clientes: number;
    clientes_activos: number;
    total_facturado: number;
    saldo_pendiente: number;
    promedio_credito: number;
    nuevos_este_mes: number;
}

// Estadísticas de inventario
export interface EstadisticasInventario {
    total_productos: number;
    productos_activos: number;
    valor_total_inventario: number;
    productos_stock_bajo: number;
    productos_sin_stock: number;
    rotacion_promedio: number;
}

// Vista de productos con stock bajo
export interface ProductoStockBajo {
    id: string;
    nombre: string;
    codigo: string;
    stock_actual: number;
    stock_minimo: number;
    negocio_nombre: string;
    categoria_nombre?: string;
    proveedor_nombre?: string;
}

// =====================================================
// 🎯 CONSTANTES Y CONFIGURACIONES
// =====================================================

export const TIPOS_DOCUMENTO = [
    { value: 'cedula', label: 'Cédula de Ciudadanía' },
    { value: 'cedula_extranjeria', label: 'Cédula de Extranjería' },
    { value: 'pasaporte', label: 'Pasaporte' },
    { value: 'nit', label: 'NIT' },
    { value: 'rut', label: 'RUT' }
] as const;

export const TIPOS_CLIENTE = [
    { value: 'individual', label: 'Persona Natural', icono: '👤' },
    { value: 'empresa', label: 'Empresa', icono: '🏢' },
    { value: 'gobierno', label: 'Entidad Gubernamental', icono: '🏛️' }
] as const;

export const CATEGORIAS_CLIENTE = [
    { value: 'premium', label: 'Premium', color: '#8B5CF6', icono: '💎' },
    { value: 'gold', label: 'Gold', color: '#F59E0B', icono: '🥇' },
    { value: 'silver', label: 'Silver', color: '#6B7280', icono: '🥈' },
    { value: 'regular', label: 'Regular', color: '#3B82F6', icono: '👤' },
    { value: 'nuevo', label: 'Nuevo', color: '#10B981', icono: '🆕' }
] as const;

export const ESTADOS_CLIENTE = [
    { value: 'activo', label: 'Activo', color: '#10B981' },
    { value: 'inactivo', label: 'Inactivo', color: '#6B7280' },
    { value: 'suspendido', label: 'Suspendido', color: '#F59E0B' },
    { value: 'bloqueado', label: 'Bloqueado', color: '#EF4444' }
] as const;

export const TIPOS_PROVEEDOR = [
    { value: 'productos', label: 'Productos', icono: '📦' },
    { value: 'servicios', label: 'Servicios', icono: '🛠️' },
    { value: 'mixto', label: 'Productos y Servicios', icono: '🔄' }
] as const;

export const CATEGORIAS_PROVEEDOR = [
    { value: 'estrategico', label: 'Estratégico', color: '#8B5CF6' },
    { value: 'preferido', label: 'Preferido', color: '#10B981' },
    { value: 'regular', label: 'Regular', color: '#3B82F6' },
    { value: 'ocasional', label: 'Ocasional', color: '#6B7280' }
] as const;

export const TIPOS_PRODUCTO = [
    { value: 'fisico', label: 'Producto Físico', icono: '📦' },
    { value: 'servicio', label: 'Servicio', icono: '🛠️' },
    { value: 'digital', label: 'Producto Digital', icono: '💻' }
] as const;

export const ESTADOS_PRODUCTO = [
    { value: 'activo', label: 'Activo', color: '#10B981' },
    { value: 'inactivo', label: 'Inactivo', color: '#6B7280' },
    { value: 'descontinuado', label: 'Descontinuado', color: '#F59E0B' },
    { value: 'agotado', label: 'Agotado', color: '#EF4444' }
] as const;

export const UNIDADES_MEDIDA = [
    { value: 'unidad', label: 'Unidad' },
    { value: 'kg', label: 'Kilogramo' },
    { value: 'g', label: 'Gramo' },
    { value: 'l', label: 'Litro' },
    { value: 'ml', label: 'Mililitro' },
    { value: 'm', label: 'Metro' },
    { value: 'cm', label: 'Centímetro' },
    { value: 'm2', label: 'Metro Cuadrado' },
    { value: 'm3', label: 'Metro Cúbico' },
    { value: 'caja', label: 'Caja' },
    { value: 'paquete', label: 'Paquete' },
    { value: 'docena', label: 'Docena' },
    { value: 'par', label: 'Par' }
] as const;

export const TIPOS_MOVIMIENTO_INVENTARIO = [
    // Entradas
    { value: 'entrada_compra', label: 'Compra', tipo: 'entrada', icono: '📥', color: '#10B981' },
    { value: 'entrada_devolucion', label: 'Devolución de Cliente', tipo: 'entrada', icono: '↩️', color: '#10B981' },
    { value: 'entrada_ajuste', label: 'Ajuste de Inventario', tipo: 'entrada', icono: '⚖️', color: '#10B981' },
    { value: 'entrada_inicial', label: 'Inventario Inicial', tipo: 'entrada', icono: '🎯', color: '#10B981' },
    
    // Salidas
    { value: 'salida_venta', label: 'Venta', tipo: 'salida', icono: '📤', color: '#EF4444' },
    { value: 'salida_devolucion', label: 'Devolución a Proveedor', tipo: 'salida', icono: '↪️', color: '#EF4444' },
    { value: 'salida_ajuste', label: 'Ajuste de Inventario', tipo: 'salida', icono: '⚖️', color: '#EF4444' },
    { value: 'salida_merma', label: 'Merma/Pérdida', tipo: 'salida', icono: '📉', color: '#EF4444' },
    { value: 'salida_regalo', label: 'Regalo/Promoción', tipo: 'salida', icono: '🎁', color: '#EF4444' }
] as const;

// =====================================================
// 🔧 FUNCIONES DE UTILIDAD
// =====================================================

export const obtenerLabelTipoDocumento = (tipo: TipoDocumento): string => {
    return TIPOS_DOCUMENTO.find(t => t.value === tipo)?.label || tipo;
};

export const obtenerColorCategoria = (categoria: CategoriaCliente): string => {
    return CATEGORIAS_CLIENTE.find(c => c.value === categoria)?.color || '#3B82F6';
};

export const obtenerColorEstado = (estado: EstadoCliente | EstadoProveedor | EstadoProducto): string => {
    const estadosMap = {
        'activo': '#10B981',
        'inactivo': '#6B7280',
        'suspendido': '#F59E0B',
        'bloqueado': '#EF4444',
        'descontinuado': '#F59E0B',
        'agotado': '#EF4444'
    };
    return estadosMap[estado] || '#6B7280';
};

export const calcularPuntuacionCredito = (cliente: Partial<Cliente>): number => {
    let puntuacion = 100;
    
    // Reducir por saldo pendiente
    if (cliente.saldo_pendiente && cliente.limite_credito) {
        const porcentajeUso = (cliente.saldo_pendiente / cliente.limite_credito) * 100;
        if (porcentajeUso > 80) puntuacion -= 30;
        else if (porcentajeUso > 60) puntuacion -= 20;
        else if (porcentajeUso > 40) puntuacion -= 10;
    }
    
    // Bonificar por historial de pagos
    if (cliente.total_pagado && cliente.total_facturado) {
        const porcentajePago = (cliente.total_pagado / cliente.total_facturado) * 100;
        if (porcentajePago >= 95) puntuacion += 10;
        else if (porcentajePago < 80) puntuacion -= 20;
    }
    
    return Math.max(0, Math.min(100, puntuacion));
};

export const formatearStockAlerta = (producto: Producto): { nivel: 'critico' | 'bajo' | 'normal', mensaje: string } => {
    if (producto.stock_actual <= 0) {
        return { nivel: 'critico', mensaje: 'Sin stock' };
    } else if (producto.stock_actual <= producto.stock_minimo) {
        return { nivel: 'bajo', mensaje: 'Stock bajo' };
    } else {
        return { nivel: 'normal', mensaje: 'Stock normal' };
    }
}; 