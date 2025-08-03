-- =====================================================
-- 🚀 SAAS SÚPER PODEROSO - ESQUEMA COMPLETO 🚀
-- App Contabilidad - Marketing - Analíticas
-- =====================================================

-- ⚠️ EJECUTA DESPUÉS DEL DIAGNÓSTICO
-- Este script AGREGA las funcionalidades que faltan

-- Habilitar extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- =====================================================
-- 👤 PERFILES DE USUARIO Y SUSCRIPCIONES
-- =====================================================

-- Tabla: Perfiles de usuario con roles y suscripciones
CREATE TABLE IF NOT EXISTS usuarios_perfiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    nombre_completo VARCHAR(255),
    empresa VARCHAR(255),
    telefono VARCHAR(20),
    direccion TEXT,
    pais VARCHAR(3) DEFAULT 'COL',
    zona_horaria VARCHAR(50) DEFAULT 'America/Bogota',
    
    -- 👑 ROL Y SUSCRIPCIÓN
    rol VARCHAR(20) NOT NULL DEFAULT 'usuario',
    plan_suscripcion VARCHAR(20) NOT NULL DEFAULT 'gratis',
    fecha_suscripcion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_vencimiento TIMESTAMP WITH TIME ZONE,
    estado_suscripcion VARCHAR(20) NOT NULL DEFAULT 'activa',
    
    -- 📊 LÍMITES POR PLAN
    limite_proyectos INTEGER DEFAULT 3, -- Gratis: 3, Premium: ilimitado
    limite_negocios INTEGER DEFAULT 1,  -- Gratis: 1, Premium: ilimitado
    limite_movimientos_mes INTEGER DEFAULT 50, -- Gratis: 50/mes, Premium: ilimitado
    
    -- 📱 CONFIGURACIONES
    configuracion_notificaciones JSONB DEFAULT '{"email": true, "push": false}',
    tema VARCHAR(20) DEFAULT 'light',
    idioma VARCHAR(5) DEFAULT 'es',
    
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT usuarios_rol_check CHECK (rol IN ('admin', 'usuario')),
    CONSTRAINT usuarios_plan_check CHECK (plan_suscripcion IN ('gratis', 'premium')),
    CONSTRAINT usuarios_estado_check CHECK (estado_suscripcion IN ('activa', 'suspendida', 'cancelada'))
);

-- =====================================================
-- 💰 GASTOS PERSONALES (SE INTEGRAN AL BALANCE PRINCIPAL)
-- =====================================================

-- Tabla: Gastos personales (separados pero contados en balance general)
CREATE TABLE IF NOT EXISTS gastos_personales (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
    
    -- 💵 INFORMACIÓN DEL GASTO
    monto DECIMAL(15,2) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_gasto DATE NOT NULL DEFAULT CURRENT_DATE,
    metodo_pago VARCHAR(50),
    
    -- 📍 CONTEXTO ADICIONAL
    ubicacion VARCHAR(255), -- Dónde se hizo el gasto
    es_recurrente BOOLEAN DEFAULT FALSE,
    frecuencia_recurrencia VARCHAR(20), -- mensual, semanal, etc.
    comprobante_url TEXT,
    notas TEXT,
    
    -- 🏷️ CATEGORIZACIÓN ADICIONAL
    tipo_gasto_personal VARCHAR(50) NOT NULL DEFAULT 'general',
    impacta_negocios BOOLEAN DEFAULT FALSE, -- Si afecta los negocios
    
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT gastos_monto_check CHECK (monto > 0),
    CONSTRAINT gastos_metodo_check CHECK (metodo_pago IN ('efectivo', 'transferencia', 'tarjeta', 'cheque', 'digital', 'crypto', 'otro')),
    CONSTRAINT gastos_tipo_check CHECK (tipo_gasto_personal IN ('alimentacion', 'transporte', 'vivienda', 'salud', 'educacion', 'entretenimiento', 'ropa', 'tecnologia', 'inversiones', 'general')),
    CONSTRAINT gastos_frecuencia_check CHECK (frecuencia_recurrencia IN ('diaria', 'semanal', 'mensual', 'trimestral', 'anual'))
);

-- =====================================================
-- 📢 MARKETING Y CAMPAÑAS POR NEGOCIO
-- =====================================================

-- Tabla: Campañas de marketing
CREATE TABLE IF NOT EXISTS campanas_marketing (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    negocio_id UUID REFERENCES negocios(id) ON DELETE CASCADE NOT NULL,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- 📢 INFORMACIÓN DE LA CAMPAÑA
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo_campana VARCHAR(50) NOT NULL,
    plataforma VARCHAR(50) NOT NULL,
    objetivo VARCHAR(100) NOT NULL,
    
    -- 💰 PRESUPUESTO Y GASTOS
    presupuesto_total DECIMAL(15,2) NOT NULL,
    gastado_actual DECIMAL(15,2) DEFAULT 0,
    costo_por_clic DECIMAL(10,4),
    costo_por_conversion DECIMAL(10,4),
    
    -- 📅 FECHAS
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 📊 MÉTRICAS
    impresiones INTEGER DEFAULT 0,
    clics INTEGER DEFAULT 0,
    conversiones INTEGER DEFAULT 0,
    alcance INTEGER DEFAULT 0,
    
    -- 🎯 AUDIENCIA OBJETIVO
    audiencia_objetivo JSONB, -- {'edad': '25-40', 'genero': 'todos', 'intereses': ['tech', 'business']}
    
    -- 📱 ESTADO Y CONFIGURACIÓN
    estado VARCHAR(20) NOT NULL DEFAULT 'borrador',
    configuracion_avanzada JSONB,
    
    CONSTRAINT campanas_tipo_check CHECK (tipo_campana IN ('google_ads', 'facebook_ads', 'instagram_ads', 'linkedin_ads', 'email_marketing', 'influencer', 'seo', 'contenido', 'evento', 'tradicional', 'otro')),
    CONSTRAINT campanas_plataforma_check CHECK (plataforma IN ('google', 'facebook', 'instagram', 'linkedin', 'youtube', 'tiktok', 'email', 'whatsapp', 'website', 'offline', 'otro')),
    CONSTRAINT campanas_estado_check CHECK (estado IN ('borrador', 'activa', 'pausada', 'completada', 'cancelada')),
    CONSTRAINT campanas_presupuesto_check CHECK (presupuesto_total > 0),
    CONSTRAINT campanas_gastado_check CHECK (gastado_actual >= 0)
);

-- =====================================================
-- 🤖 AUTOMATIZACIONES DE MARKETING
-- =====================================================

-- Tabla: Automatizaciones
CREATE TABLE IF NOT EXISTS automatizaciones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    negocio_id UUID REFERENCES negocios(id) ON DELETE CASCADE NOT NULL,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- 🤖 INFORMACIÓN DE LA AUTOMATIZACIÓN
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo_automatizacion VARCHAR(50) NOT NULL,
    
    -- ⚡ TRIGGER Y ACCIONES
    evento_trigger JSONB NOT NULL, -- {'tipo': 'nuevo_cliente', 'condiciones': {...}}
    acciones JSONB NOT NULL, -- [{'tipo': 'enviar_email', 'template': 'bienvenida', 'delay': '1 hour'}]
    
    -- 📅 PROGRAMACIÓN
    frecuencia VARCHAR(20),
    hora_ejecucion TIME,
    dias_activa INTEGER[], -- [1,2,3,4,5] para lunes a viernes
    
    -- 📊 ESTADÍSTICAS
    total_ejecutadas INTEGER DEFAULT 0,
    total_exitosas INTEGER DEFAULT 0,
    total_fallidas INTEGER DEFAULT 0,
    ultima_ejecucion TIMESTAMP WITH TIME ZONE,
    
    -- ⚙️ CONFIGURACIÓN
    estado VARCHAR(20) NOT NULL DEFAULT 'activa',
    configuracion_avanzada JSONB,
    
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT auto_tipo_check CHECK (tipo_automatizacion IN ('email_secuencia', 'seguimiento_cliente', 'recordatorio_pago', 'bienvenida', 'abandono_carrito', 'cumpleanos', 'feedback', 'reactivacion', 'promocion', 'otro')),
    CONSTRAINT auto_estado_check CHECK (estado IN ('activa', 'pausada', 'inactiva')),
    CONSTRAINT auto_frecuencia_check CHECK (frecuencia IN ('una_vez', 'diaria', 'semanal', 'mensual', 'evento'))
);

-- =====================================================
-- 🎯 PRESUPUESTOS Y METAS FINANCIERAS
-- =====================================================

-- Tabla: Presupuestos por categoría
CREATE TABLE IF NOT EXISTS presupuestos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    negocio_id UUID REFERENCES negocios(id) ON DELETE CASCADE, -- NULL = presupuesto personal
    categoria_id UUID REFERENCES categorias(id) ON DELETE CASCADE,
    
    -- 💰 PRESUPUESTO
    nombre VARCHAR(255) NOT NULL,
    monto_presupuestado DECIMAL(15,2) NOT NULL,
    monto_gastado DECIMAL(15,2) DEFAULT 0,
    periodo VARCHAR(20) NOT NULL DEFAULT 'mensual',
    
    -- 📅 VIGENCIA
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    
    -- 🚨 ALERTAS
    alerta_porcentaje INTEGER DEFAULT 80, -- Alertar al 80%
    alerta_enviada BOOLEAN DEFAULT FALSE,
    
    -- 📊 CONFIGURACIÓN
    es_recurrente BOOLEAN DEFAULT FALSE,
    auto_renovar BOOLEAN DEFAULT FALSE,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo',
    
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT presupuesto_monto_check CHECK (monto_presupuestado > 0),
    CONSTRAINT presupuesto_periodo_check CHECK (periodo IN ('semanal', 'mensual', 'trimestral', 'semestral', 'anual')),
    CONSTRAINT presupuesto_estado_check CHECK (estado IN ('activo', 'pausado', 'completado')),
    CONSTRAINT presupuesto_alerta_check CHECK (alerta_porcentaje BETWEEN 1 AND 100)
);

-- Tabla: Metas financieras
CREATE TABLE IF NOT EXISTS metas_financieras (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    negocio_id UUID REFERENCES negocios(id) ON DELETE CASCADE, -- NULL = meta personal
    
    -- 🎯 META
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo_meta VARCHAR(30) NOT NULL,
    monto_objetivo DECIMAL(15,2) NOT NULL,
    monto_actual DECIMAL(15,2) DEFAULT 0,
    
    -- 📅 PLAZOS
    fecha_inicio DATE NOT NULL,
    fecha_objetivo DATE NOT NULL,
    
    -- 📊 SEGUIMIENTO
    porcentaje_completado DECIMAL(5,2) DEFAULT 0,
    estado VARCHAR(20) NOT NULL DEFAULT 'en_progreso',
    
    -- 🎉 RECOMPENSAS
    recompensa TEXT, -- Qué se hará al cumplir la meta
    
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT meta_tipo_check CHECK (tipo_meta IN ('ahorro', 'ingresos', 'reducir_gastos', 'rentabilidad', 'inversion', 'otro')),
    CONSTRAINT meta_estado_check CHECK (estado IN ('en_progreso', 'completada', 'pausada', 'cancelada')),
    CONSTRAINT meta_monto_check CHECK (monto_objetivo > 0),
    CONSTRAINT meta_porcentaje_check CHECK (porcentaje_completado BETWEEN 0 AND 100)
);

-- =====================================================
-- 📊 MÉTRICAS EN TIEMPO REAL
-- =====================================================

-- Tabla: Métricas calculadas en tiempo real
CREATE TABLE IF NOT EXISTS metricas_tiempo_real (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    negocio_id UUID REFERENCES negocios(id) ON DELETE CASCADE, -- NULL = métricas generales
    
    -- 📊 TIPO DE MÉTRICA
    tipo_metrica VARCHAR(50) NOT NULL,
    nombre_metrica VARCHAR(100) NOT NULL,
    valor_actual DECIMAL(15,4) NOT NULL,
    valor_anterior DECIMAL(15,4),
    variacion_porcentual DECIMAL(8,4),
    
    -- 📅 PERÍODO
    periodo VARCHAR(20) NOT NULL,
    fecha_calculo TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 📈 DATOS ADICIONALES
    datos_detalle JSONB, -- Información adicional de la métrica
    tendencia VARCHAR(20), -- 'subiendo', 'bajando', 'estable'
    
    CONSTRAINT metrica_tipo_check CHECK (tipo_metrica IN ('flujo_caja', 'rentabilidad', 'gastos', 'ingresos', 'conversion', 'roi_marketing', 'crecimiento', 'otro')),
    CONSTRAINT metrica_periodo_check CHECK (periodo IN ('tiempo_real', 'diario', 'semanal', 'mensual', 'trimestral', 'anual')),
    CONSTRAINT metrica_tendencia_check CHECK (tendencia IN ('subiendo', 'bajando', 'estable', 'volatil'))
);

-- =====================================================
-- 🔔 NOTIFICACIONES INTELIGENTES
-- =====================================================

-- Tabla: Notificaciones del sistema
CREATE TABLE IF NOT EXISTS notificaciones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- 📱 INFORMACIÓN DE LA NOTIFICACIÓN
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo_notificacion VARCHAR(30) NOT NULL,
    categoria VARCHAR(30) NOT NULL,
    
    -- 🎯 DATOS RELACIONADOS
    entidad_tipo VARCHAR(30), -- 'proyecto', 'negocio', 'gasto', etc.
    entidad_id UUID, -- ID de la entidad relacionada
    
    -- 📊 PRIORIDAD Y ESTADO
    prioridad VARCHAR(20) NOT NULL DEFAULT 'media',
    estado VARCHAR(20) NOT NULL DEFAULT 'no_leida',
    
    -- 📅 PROGRAMACIÓN
    fecha_programada TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_enviada TIMESTAMP WITH TIME ZONE,
    fecha_leida TIMESTAMP WITH TIME ZONE,
    
    -- 📱 CANALES
    canales_envio VARCHAR(50)[] DEFAULT ARRAY['app'], -- 'app', 'email', 'sms', 'push'
    enviada_por_canal JSONB DEFAULT '{}', -- {'email': true, 'push': false}
    
    -- ⚙️ METADATOS
    accion_url TEXT, -- URL para action button
    datos_adicionales JSONB,
    
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT notif_tipo_check CHECK (tipo_notificacion IN ('info', 'warning', 'error', 'success', 'marketing', 'sistema')),
    CONSTRAINT notif_categoria_check CHECK (categoria IN ('financiera', 'proyecto', 'marketing', 'sistema', 'personal', 'meta', 'presupuesto')),
    CONSTRAINT notif_prioridad_check CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente')),
    CONSTRAINT notif_estado_check CHECK (estado IN ('no_leida', 'leida', 'archivada', 'eliminada'))
);

-- =====================================================
-- 📋 LOG DE ACTIVIDADES (AUDITORÍA)
-- =====================================================

-- Tabla: Registro de todas las actividades del usuario
CREATE TABLE IF NOT EXISTS actividad_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- 📝 ACTIVIDAD
    accion VARCHAR(50) NOT NULL,
    entidad_tipo VARCHAR(30) NOT NULL,
    entidad_id UUID,
    entidad_nombre VARCHAR(255),
    
    -- 🔍 DETALLES
    detalles_anteriores JSONB, -- Estado antes del cambio
    detalles_nuevos JSONB, -- Estado después del cambio
    descripcion TEXT,
    
    -- 🌐 CONTEXTO
    ip_address INET,
    user_agent TEXT,
    dispositivo VARCHAR(50),
    ubicacion_geografica VARCHAR(100),
    
    -- 📊 IMPACTO
    impacto_financiero DECIMAL(15,2), -- Si la acción tiene impacto económico
    
    fecha_actividad TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT log_accion_check CHECK (accion IN ('crear', 'editar', 'eliminar', 'ver', 'exportar', 'importar', 'login', 'logout', 'pago', 'configurar')),
    CONSTRAINT log_entidad_check CHECK (entidad_tipo IN ('proyecto', 'tarea', 'negocio', 'movimiento', 'gasto_personal', 'campana', 'automatizacion', 'presupuesto', 'meta', 'usuario', 'suscripcion'))
);

-- =====================================================
-- 📈 ÍNDICES PARA OPTIMIZACIÓN EXTREMA
-- =====================================================

-- Índices para usuarios_perfiles
CREATE INDEX IF NOT EXISTS idx_usuarios_perfiles_usuario_id ON usuarios_perfiles(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfiles_plan ON usuarios_perfiles(plan_suscripcion);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfiles_estado ON usuarios_perfiles(estado_suscripcion);

-- Índices para gastos_personales
CREATE INDEX IF NOT EXISTS idx_gastos_personales_usuario_id ON gastos_personales(usuario_id);
CREATE INDEX IF NOT EXISTS idx_gastos_personales_fecha ON gastos_personales(fecha_gasto);
CREATE INDEX IF NOT EXISTS idx_gastos_personales_categoria ON gastos_personales(categoria_id);
CREATE INDEX IF NOT EXISTS idx_gastos_personales_tipo ON gastos_personales(tipo_gasto_personal);

-- Índices para campañas
CREATE INDEX IF NOT EXISTS idx_campanas_negocio_id ON campanas_marketing(negocio_id);
CREATE INDEX IF NOT EXISTS idx_campanas_usuario_id ON campanas_marketing(usuario_id);
CREATE INDEX IF NOT EXISTS idx_campanas_fecha_inicio ON campanas_marketing(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_campanas_estado ON campanas_marketing(estado);
CREATE INDEX IF NOT EXISTS idx_campanas_tipo ON campanas_marketing(tipo_campana);

-- Índices para automatizaciones
CREATE INDEX IF NOT EXISTS idx_automatizaciones_negocio_id ON automatizaciones(negocio_id);
CREATE INDEX IF NOT EXISTS idx_automatizaciones_estado ON automatizaciones(estado);
CREATE INDEX IF NOT EXISTS idx_automatizaciones_tipo ON automatizaciones(tipo_automatizacion);

-- Índices para presupuestos
CREATE INDEX IF NOT EXISTS idx_presupuestos_usuario_id ON presupuestos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_presupuestos_negocio_id ON presupuestos(negocio_id);
CREATE INDEX IF NOT EXISTS idx_presupuestos_categoria ON presupuestos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_presupuestos_fecha ON presupuestos(fecha_inicio, fecha_fin);

-- Índices para metas
CREATE INDEX IF NOT EXISTS idx_metas_usuario_id ON metas_financieras(usuario_id);
CREATE INDEX IF NOT EXISTS idx_metas_negocio_id ON metas_financieras(negocio_id);
CREATE INDEX IF NOT EXISTS idx_metas_estado ON metas_financieras(estado);
CREATE INDEX IF NOT EXISTS idx_metas_fecha ON metas_financieras(fecha_objetivo);

-- Índices para métricas
CREATE INDEX IF NOT EXISTS idx_metricas_usuario_id ON metricas_tiempo_real(usuario_id);
CREATE INDEX IF NOT EXISTS idx_metricas_negocio_id ON metricas_tiempo_real(negocio_id);
CREATE INDEX IF NOT EXISTS idx_metricas_tipo ON metricas_tiempo_real(tipo_metrica);
CREATE INDEX IF NOT EXISTS idx_metricas_fecha ON metricas_tiempo_real(fecha_calculo);

-- Índices para notificaciones
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario_id ON notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_estado ON notificaciones(estado);
CREATE INDEX IF NOT EXISTS idx_notificaciones_tipo ON notificaciones(tipo_notificacion);
CREATE INDEX IF NOT EXISTS idx_notificaciones_fecha ON notificaciones(fecha_programada);

-- Índices para log
CREATE INDEX IF NOT EXISTS idx_log_usuario_id ON actividad_log(usuario_id);
CREATE INDEX IF NOT EXISTS idx_log_fecha ON actividad_log(fecha_actividad);
CREATE INDEX IF NOT EXISTS idx_log_accion ON actividad_log(accion);
CREATE INDEX IF NOT EXISTS idx_log_entidad ON actividad_log(entidad_tipo, entidad_id);

-- =====================================================
-- 🔒 POLÍTICAS RLS SÚPER SEGURAS
-- =====================================================

-- Habilitar RLS en todas las nuevas tablas
ALTER TABLE usuarios_perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos_personales ENABLE ROW LEVEL SECURITY;
ALTER TABLE campanas_marketing ENABLE ROW LEVEL SECURITY;
ALTER TABLE automatizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE presupuestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas_financieras ENABLE ROW LEVEL SECURITY;
ALTER TABLE metricas_tiempo_real ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividad_log ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios_perfiles
DROP POLICY IF EXISTS "Usuario ve solo su perfil" ON usuarios_perfiles;
CREATE POLICY "Usuario ve solo su perfil" ON usuarios_perfiles
    FOR ALL USING (auth.uid() = usuario_id);

-- Políticas para gastos_personales
DROP POLICY IF EXISTS "Usuario ve solo sus gastos personales" ON gastos_personales;
CREATE POLICY "Usuario ve solo sus gastos personales" ON gastos_personales
    FOR ALL USING (auth.uid() = usuario_id);

-- Políticas para campañas_marketing
DROP POLICY IF EXISTS "Usuario ve solo campañas de sus negocios" ON campanas_marketing;
CREATE POLICY "Usuario ve solo campañas de sus negocios" ON campanas_marketing
    FOR ALL USING (
        auth.uid() = usuario_id OR
        EXISTS (
            SELECT 1 FROM negocios 
            WHERE negocios.id = campanas_marketing.negocio_id 
            AND negocios.usuario_id = auth.uid()
        )
    );

-- Políticas para automatizaciones
DROP POLICY IF EXISTS "Usuario ve solo automatizaciones de sus negocios" ON automatizaciones;
CREATE POLICY "Usuario ve solo automatizaciones de sus negocios" ON automatizaciones
    FOR ALL USING (
        auth.uid() = usuario_id OR
        EXISTS (
            SELECT 1 FROM negocios 
            WHERE negocios.id = automatizaciones.negocio_id 
            AND negocios.usuario_id = auth.uid()
        )
    );

-- Políticas para presupuestos
DROP POLICY IF EXISTS "Usuario ve solo sus presupuestos" ON presupuestos;
CREATE POLICY "Usuario ve solo sus presupuestos" ON presupuestos
    FOR ALL USING (auth.uid() = usuario_id);

-- Políticas para metas_financieras
DROP POLICY IF EXISTS "Usuario ve solo sus metas" ON metas_financieras;
CREATE POLICY "Usuario ve solo sus metas" ON metas_financieras
    FOR ALL USING (auth.uid() = usuario_id);

-- Políticas para metricas_tiempo_real
DROP POLICY IF EXISTS "Usuario ve solo sus métricas" ON metricas_tiempo_real;
CREATE POLICY "Usuario ve solo sus métricas" ON metricas_tiempo_real
    FOR ALL USING (auth.uid() = usuario_id);

-- Políticas para notificaciones
DROP POLICY IF EXISTS "Usuario ve solo sus notificaciones" ON notificaciones;
CREATE POLICY "Usuario ve solo sus notificaciones" ON notificaciones
    FOR ALL USING (auth.uid() = usuario_id);

-- Políticas para actividad_log
DROP POLICY IF EXISTS "Usuario ve solo su actividad" ON actividad_log;
CREATE POLICY "Usuario ve solo su actividad" ON actividad_log
    FOR ALL USING (auth.uid() = usuario_id);

-- =====================================================
-- 🚀 TRIGGERS PARA AUTOMATIZACIÓN
-- =====================================================

-- Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION crear_perfil_usuario()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO usuarios_perfiles (usuario_id, rol, plan_suscripcion, limite_proyectos, limite_negocios, limite_movimientos_mes)
    VALUES (NEW.id, 'usuario', 'gratis', 3, 1, 50);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil al registrarse
DROP TRIGGER IF EXISTS trigger_crear_perfil ON auth.users;
CREATE TRIGGER trigger_crear_perfil
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION crear_perfil_usuario();

-- Función para actualizar métricas en tiempo real
CREATE OR REPLACE FUNCTION actualizar_metricas_tiempo_real()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar métricas cuando hay movimientos financieros
    IF TG_TABLE_NAME = 'movimientos_financieros' THEN
        -- Lógica para actualizar flujo de caja, etc.
        INSERT INTO metricas_tiempo_real (usuario_id, negocio_id, tipo_metrica, nombre_metrica, valor_actual, periodo)
        SELECT 
            n.usuario_id,
            NEW.negocio_id,
            'flujo_caja',
            'Balance Actual',
            COALESCE(SUM(CASE WHEN m.tipo_movimiento = 'ingreso' THEN m.monto ELSE -m.monto END), 0),
            'tiempo_real'
        FROM negocios n
        LEFT JOIN movimientos_financieros m ON n.id = m.negocio_id
        WHERE n.id = NEW.negocio_id
        GROUP BY n.usuario_id, n.id
        ON CONFLICT (usuario_id, negocio_id, tipo_metrica, periodo) 
        DO UPDATE SET 
            valor_actual = EXCLUDED.valor_actual,
            fecha_calculo = NOW();
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para métricas en tiempo real
DROP TRIGGER IF EXISTS trigger_metricas_movimientos ON movimientos_financieros;
CREATE TRIGGER trigger_metricas_movimientos
    AFTER INSERT OR UPDATE OR DELETE ON movimientos_financieros
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_metricas_tiempo_real();

-- Función para crear notificaciones automáticas
CREATE OR REPLACE FUNCTION crear_notificacion_automatica()
RETURNS TRIGGER AS $$
BEGIN
    -- Notificar cuando se excede presupuesto
    IF TG_TABLE_NAME = 'presupuestos' AND NEW.monto_gastado >= (NEW.monto_presupuestado * NEW.alerta_porcentaje / 100) AND NOT NEW.alerta_enviada THEN
        INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo_notificacion, categoria, prioridad, entidad_tipo, entidad_id)
        VALUES (
            NEW.usuario_id,
            '⚠️ Presupuesto Excedido',
            'Has alcanzado el ' || NEW.alerta_porcentaje || '% de tu presupuesto "' || NEW.nombre || '"',
            'warning',
            'presupuesto',
            'alta',
            'presupuesto',
            NEW.id
        );
        
        NEW.alerta_enviada = TRUE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para notificaciones de presupuesto
DROP TRIGGER IF EXISTS trigger_notificacion_presupuesto ON presupuestos;
CREATE TRIGGER trigger_notificacion_presupuesto
    BEFORE UPDATE ON presupuestos
    FOR EACH ROW
    EXECUTE FUNCTION crear_notificacion_automatica();

-- =====================================================
-- 🎯 VISTAS SÚPER PODEROSAS
-- =====================================================

-- Vista: Dashboard financiero completo
DROP VIEW IF EXISTS vista_dashboard_financiero;
CREATE VIEW vista_dashboard_financiero AS
SELECT 
    u.usuario_id,
    up.nombre_completo,
    up.plan_suscripcion,
    
    -- 💰 BALANCE TOTAL (Negocios + Personal)
    COALESCE(balance_negocios.total, 0) + COALESCE(balance_personal.total, 0) as balance_total,
    COALESCE(balance_negocios.total, 0) as balance_negocios,
    COALESCE(balance_personal.total, 0) as balance_gastos_personales,
    
    -- 📊 INGRESOS Y GASTOS DEL MES
    COALESCE(ingresos_mes.total, 0) as ingresos_mes_actual,
    COALESCE(gastos_mes.total, 0) as gastos_mes_actual,
    COALESCE(gastos_personales_mes.total, 0) as gastos_personales_mes,
    
    -- 📈 CRECIMIENTO
    COALESCE(ingresos_mes.total, 0) - COALESCE(gastos_mes.total, 0) - COALESCE(gastos_personales_mes.total, 0) as flujo_caja_mes,
    
    -- 📊 MÉTRICAS ADICIONALES
    COALESCE(proyectos_activos.total, 0) as proyectos_activos,
    COALESCE(campanas_activas.total, 0) as campanas_activas,
    COALESCE(metas_progreso.promedio, 0) as promedio_metas
    
FROM usuarios_perfiles up
INNER JOIN auth.users u ON up.usuario_id = u.id

-- Balance de negocios
LEFT JOIN (
    SELECT 
        n.usuario_id,
        SUM(CASE WHEN m.tipo_movimiento = 'ingreso' THEN m.monto ELSE -m.monto END) as total
    FROM negocios n
    LEFT JOIN movimientos_financieros m ON n.id = m.negocio_id
    GROUP BY n.usuario_id
) balance_negocios ON up.usuario_id = balance_negocios.usuario_id

-- Gastos personales
LEFT JOIN (
    SELECT 
        gp.usuario_id,
        -SUM(gp.monto) as total
    FROM gastos_personales gp
    GROUP BY gp.usuario_id
) balance_personal ON up.usuario_id = balance_personal.usuario_id

-- Ingresos del mes
LEFT JOIN (
    SELECT 
        n.usuario_id,
        SUM(m.monto) as total
    FROM negocios n
    INNER JOIN movimientos_financieros m ON n.id = m.negocio_id
    WHERE m.tipo_movimiento = 'ingreso'
    AND EXTRACT(MONTH FROM m.fecha_movimiento) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(YEAR FROM m.fecha_movimiento) = EXTRACT(YEAR FROM CURRENT_DATE)
    GROUP BY n.usuario_id
) ingresos_mes ON up.usuario_id = ingresos_mes.usuario_id

-- Gastos de negocios del mes
LEFT JOIN (
    SELECT 
        n.usuario_id,
        SUM(m.monto) as total
    FROM negocios n
    INNER JOIN movimientos_financieros m ON n.id = m.negocio_id
    WHERE m.tipo_movimiento = 'gasto'
    AND EXTRACT(MONTH FROM m.fecha_movimiento) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(YEAR FROM m.fecha_movimiento) = EXTRACT(YEAR FROM CURRENT_DATE)
    GROUP BY n.usuario_id
) gastos_mes ON up.usuario_id = gastos_mes.usuario_id

-- Gastos personales del mes
LEFT JOIN (
    SELECT 
        gp.usuario_id,
        SUM(gp.monto) as total
    FROM gastos_personales gp
    WHERE EXTRACT(MONTH FROM gp.fecha_gasto) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(YEAR FROM gp.fecha_gasto) = EXTRACT(YEAR FROM CURRENT_DATE)
    GROUP BY gp.usuario_id
) gastos_personales_mes ON up.usuario_id = gastos_personales_mes.usuario_id

-- Proyectos activos
LEFT JOIN (
    SELECT 
        p.usuario_id,
        COUNT(*) as total
    FROM proyectos p
    WHERE p.estado = 'activo'
    GROUP BY p.usuario_id
) proyectos_activos ON up.usuario_id = proyectos_activos.usuario_id

-- Campañas activas
LEFT JOIN (
    SELECT 
        c.usuario_id,
        COUNT(*) as total
    FROM campanas_marketing c
    WHERE c.estado = 'activa'
    GROUP BY c.usuario_id
) campanas_activas ON up.usuario_id = campanas_activas.usuario_id

-- Promedio de progreso de metas
LEFT JOIN (
    SELECT 
        m.usuario_id,
        AVG(m.porcentaje_completado) as promedio
    FROM metas_financieras m
    WHERE m.estado = 'en_progreso'
    GROUP BY m.usuario_id
) metas_progreso ON up.usuario_id = metas_progreso.usuario_id;

-- =====================================================
-- 🚀 FUNCIONES SÚPER AVANZADAS
-- =====================================================

-- Función: Calcular ROI de campañas de marketing
CREATE OR REPLACE FUNCTION calcular_roi_marketing(campana_uuid UUID)
RETURNS JSON AS $$
DECLARE
    resultado JSON;
    ingresos_generados DECIMAL(15,2);
    costo_campana DECIMAL(15,2);
    roi_porcentaje DECIMAL(8,2);
BEGIN
    -- Obtener costo de la campaña
    SELECT gastado_actual INTO costo_campana
    FROM campanas_marketing 
    WHERE id = campana_uuid;
    
    -- Calcular ingresos generados (esto sería más complejo en la realidad)
    -- Por ahora usamos una estimación basada en conversiones
    SELECT 
        COALESCE(conversiones * 50, 0) INTO ingresos_generados  -- Asumimos $50 por conversión
    FROM campanas_marketing 
    WHERE id = campana_uuid;
    
    -- Calcular ROI
    IF costo_campana > 0 THEN
        roi_porcentaje = ((ingresos_generados - costo_campana) / costo_campana) * 100;
    ELSE
        roi_porcentaje = 0;
    END IF;
    
    SELECT json_build_object(
        'ingresos_generados', ingresos_generados,
        'costo_campana', costo_campana,
        'roi_porcentaje', roi_porcentaje,
        'rentable', roi_porcentaje > 0
    ) INTO resultado;
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: Predicción de flujo de caja
CREATE OR REPLACE FUNCTION predecir_flujo_caja(usuario_uuid UUID, meses_adelante INTEGER DEFAULT 3)
RETURNS JSON AS $$
DECLARE
    resultado JSON;
    ingresos_promedio DECIMAL(15,2);
    gastos_promedio DECIMAL(15,2);
    prediccion DECIMAL(15,2)[];
    i INTEGER;
BEGIN
    -- Calcular promedio mensual de los últimos 6 meses
    SELECT 
        COALESCE(AVG(ingresos_mes), 0),
        COALESCE(AVG(gastos_mes), 0)
    INTO ingresos_promedio, gastos_promedio
    FROM (
        SELECT 
            EXTRACT(YEAR FROM fecha_movimiento) as año,
            EXTRACT(MONTH FROM fecha_movimiento) as mes,
            SUM(CASE WHEN tipo_movimiento = 'ingreso' THEN monto ELSE 0 END) as ingresos_mes,
            SUM(CASE WHEN tipo_movimiento = 'gasto' THEN monto ELSE 0 END) as gastos_mes
        FROM movimientos_financieros mf
        INNER JOIN negocios n ON mf.negocio_id = n.id
        WHERE n.usuario_id = usuario_uuid
        AND fecha_movimiento >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY año, mes
    ) resumen_mensual;
    
    -- Incluir gastos personales
    SELECT COALESCE(AVG(gastos_personales_mes), 0) + gastos_promedio
    INTO gastos_promedio
    FROM (
        SELECT 
            EXTRACT(YEAR FROM fecha_gasto) as año,
            EXTRACT(MONTH FROM fecha_gasto) as mes,
            SUM(monto) as gastos_personales_mes
        FROM gastos_personales
        WHERE usuario_id = usuario_uuid
        AND fecha_gasto >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY año, mes
    ) gastos_personales_mensual;
    
    -- Generar predicción
    prediccion = ARRAY[]::DECIMAL[];
    FOR i IN 1..meses_adelante LOOP
        prediccion = array_append(prediccion, ingresos_promedio - gastos_promedio);
    END LOOP;
    
    SELECT json_build_object(
        'ingresos_promedio_mensual', ingresos_promedio,
        'gastos_promedio_mensual', gastos_promedio,
        'flujo_neto_promedio', ingresos_promedio - gastos_promedio,
        'prediccion_meses', prediccion,
        'fecha_calculo', NOW()
    ) INTO resultado;
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 🎉 INICIALIZACIÓN DE DATOS
-- =====================================================

-- Función para inicializar usuario con datos de ejemplo
CREATE OR REPLACE FUNCTION inicializar_usuario_demo(usuario_uuid UUID)
RETURNS VOID AS $$
BEGIN
    -- Crear categorías de ejemplo si no existen
    INSERT INTO categorias (usuario_id, nombre, tipo_categoria, color, icono) 
    SELECT usuario_uuid, nombre, tipo_categoria, color, icono
    FROM (VALUES
        ('Freelancing', 'ingreso', 'bg-green-600', 'laptop'),
        ('Consultoría', 'ingreso', 'bg-blue-600', 'users'),
        ('Oficina', 'gasto', 'bg-red-500', 'briefcase'),
        ('Marketing Digital', 'gasto', 'bg-purple-500', 'megaphone'),
        ('Alimentación', 'gasto', 'bg-orange-500', 'utensils'),
        ('Transporte', 'gasto', 'bg-green-500', 'car')
    ) AS datos(nombre, tipo_categoria, color, icono)
    WHERE NOT EXISTS (
        SELECT 1 FROM categorias 
        WHERE usuario_id = usuario_uuid 
        AND categorias.nombre = datos.nombre
    );
    
    -- Crear presupuesto de ejemplo
    INSERT INTO presupuestos (usuario_id, nombre, monto_presupuestado, categoria_id, fecha_inicio, fecha_fin)
    SELECT 
        usuario_uuid,
        'Presupuesto Marketing Mensual',
        1000.00,
        c.id,
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '1 month'
    FROM categorias c
    WHERE c.usuario_id = usuario_uuid 
    AND c.nombre = 'Marketing Digital'
    AND NOT EXISTS (
        SELECT 1 FROM presupuestos 
        WHERE usuario_id = usuario_uuid 
        AND nombre = 'Presupuesto Marketing Mensual'
    );
    
    -- Crear meta financiera de ejemplo
    INSERT INTO metas_financieras (usuario_id, nombre, tipo_meta, monto_objetivo, fecha_inicio, fecha_objetivo)
    SELECT usuario_uuid, 'Ahorrar $5000 este año', 'ahorro', 5000.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year'
    WHERE NOT EXISTS (
        SELECT 1 FROM metas_financieras 
        WHERE usuario_id = usuario_uuid 
        AND nombre = 'Ahorrar $5000 este año'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ✅ SCRIPT COMPLETADO
-- =====================================================

-- Notificar finalización
DO $$
BEGIN
    RAISE NOTICE '🚀 ¡SAAS SÚPER PODEROSO CREADO EXITOSAMENTE! 🚀';
    RAISE NOTICE '📊 Nuevas funcionalidades agregadas:';
    RAISE NOTICE '   ✅ Gastos personales integrados';
    RAISE NOTICE '   ✅ Marketing y campañas';
    RAISE NOTICE '   ✅ Automatizaciones';
    RAISE NOTICE '   ✅ Métricas en tiempo real';
    RAISE NOTICE '   ✅ Presupuestos y metas';
    RAISE NOTICE '   ✅ Notificaciones inteligentes';
    RAISE NOTICE '   ✅ Sistema de roles y suscripciones';
    RAISE NOTICE '   ✅ Auditoría completa';
    RAISE NOTICE '💪 ¡LISTO PARA DOMINAR EL MUNDO!';
END $$; 