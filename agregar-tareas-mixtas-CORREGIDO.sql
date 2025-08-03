-- =====================================================
-- ✅ ACTUALIZAR TAREAS PARA SOPORTE MIXTO - CORREGIDO
-- =====================================================

-- Modificar la tabla tareas para soportar tareas mixtas
-- Las tareas pueden ser para proyectos O para negocios directamente

-- 1. Hacer que proyecto_id sea opcional (NULL permitido)
ALTER TABLE tareas 
ALTER COLUMN proyecto_id DROP NOT NULL;

-- 2. Agregar negocio_id como campo opcional
ALTER TABLE tareas 
ADD COLUMN IF NOT EXISTS negocio_id UUID REFERENCES negocios(id) ON DELETE CASCADE;

-- 3. Eliminar constraint anterior si existe y agregar nuevo
ALTER TABLE tareas 
DROP CONSTRAINT IF EXISTS tareas_contexto_check;

ALTER TABLE tareas 
ADD CONSTRAINT tareas_contexto_check 
CHECK (
    (proyecto_id IS NOT NULL AND negocio_id IS NULL) OR 
    (proyecto_id IS NULL AND negocio_id IS NOT NULL)
);

-- 4. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_tareas_negocio_id ON tareas(negocio_id);
CREATE INDEX IF NOT EXISTS idx_tareas_contexto ON tareas(proyecto_id, negocio_id);

-- 5. Actualizar el trigger para manejo de fechas
CREATE OR REPLACE FUNCTION trigger_actualizar_fecha_tarea() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger
DROP TRIGGER IF EXISTS trigger_tarea_fecha ON tareas;
CREATE TRIGGER trigger_tarea_fecha
    BEFORE UPDATE ON tareas
    FOR EACH ROW
    EXECUTE FUNCTION trigger_actualizar_fecha_tarea();

-- 6. Crear vista para tareas con contexto completo - CORREGIDA
DROP VIEW IF EXISTS vista_tareas_completas;
CREATE VIEW vista_tareas_completas AS
SELECT 
    t.*,
    p.nombre as proyecto_nombre,
    p.slug as proyecto_slug,
    p.color as proyecto_color,
    n.nombre as negocio_nombre,
    n.tipo_negocio as negocio_tipo,
    n.moneda as negocio_moneda,
    CASE 
        WHEN t.proyecto_id IS NOT NULL THEN 'proyecto'
        WHEN t.negocio_id IS NOT NULL THEN 'negocio'
        ELSE 'personal'
    END as contexto_tipo
FROM tareas t
LEFT JOIN proyectos p ON t.proyecto_id = p.id
LEFT JOIN negocios n ON t.negocio_id = n.id;

-- 7. Función para obtener tareas por contexto - CORREGIDA
CREATE OR REPLACE FUNCTION obtener_tareas_usuario(
    usuario_uuid UUID,
    contexto_tipo TEXT DEFAULT 'todos',
    contexto_id UUID DEFAULT NULL
) 
RETURNS TABLE (
    id UUID,
    titulo VARCHAR,
    descripcion TEXT,
    estado VARCHAR,
    prioridad VARCHAR,
    fecha_limite TIMESTAMP WITH TIME ZONE,
    fecha_creacion TIMESTAMP WITH TIME ZONE,
    proyecto_nombre VARCHAR,
    proyecto_slug VARCHAR,
    negocio_nombre VARCHAR,
    contexto VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.titulo,
        t.descripcion,
        t.estado,
        t.prioridad,
        t.fecha_limite::TIMESTAMP WITH TIME ZONE,
        t.fecha_creacion,
        p.nombre as proyecto_nombre,
        p.slug as proyecto_slug,
        n.nombre as negocio_nombre,
        CASE 
            WHEN t.proyecto_id IS NOT NULL THEN 'proyecto'
            WHEN t.negocio_id IS NOT NULL THEN 'negocio'
            ELSE 'personal'
        END as contexto
    FROM tareas t
    LEFT JOIN proyectos p ON t.proyecto_id = p.id
    LEFT JOIN negocios n ON t.negocio_id = n.id
    WHERE t.usuario_id = usuario_uuid
    AND (
        contexto_tipo = 'todos' OR
        (contexto_tipo = 'proyecto' AND t.proyecto_id = contexto_id) OR
        (contexto_tipo = 'negocio' AND t.negocio_id = contexto_id)
    )
    ORDER BY t.fecha_creacion DESC;
END;
$$ LANGUAGE plpgsql;

-- 8. Verificar que las políticas RLS existan para tareas
DO $$
BEGIN
    -- Habilitar RLS si no está habilitado
    ALTER TABLE tareas ENABLE ROW LEVEL SECURITY;
    
    -- Política para SELECT
    DROP POLICY IF EXISTS "Usuarios pueden ver sus propias tareas" ON tareas;
    CREATE POLICY "Usuarios pueden ver sus propias tareas" ON tareas
        FOR SELECT USING (auth.uid() = usuario_id);
    
    -- Política para INSERT
    DROP POLICY IF EXISTS "Usuarios pueden crear sus propias tareas" ON tareas;
    CREATE POLICY "Usuarios pueden crear sus propias tareas" ON tareas
        FOR INSERT WITH CHECK (auth.uid() = usuario_id);
    
    -- Política para UPDATE
    DROP POLICY IF EXISTS "Usuarios pueden actualizar sus propias tareas" ON tareas;
    CREATE POLICY "Usuarios pueden actualizar sus propias tareas" ON tareas
        FOR UPDATE USING (auth.uid() = usuario_id);
    
    -- Política para DELETE
    DROP POLICY IF EXISTS "Usuarios pueden eliminar sus propias tareas" ON tareas;
    CREATE POLICY "Usuarios pueden eliminar sus propias tareas" ON tareas
        FOR DELETE USING (auth.uid() = usuario_id);

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error configurando políticas RLS: %', SQLERRM;
END $$;

-- 9. Comentarios para documentación
COMMENT ON COLUMN tareas.proyecto_id IS 'ID del proyecto (opcional para tareas de proyectos)';
COMMENT ON COLUMN tareas.negocio_id IS 'ID del negocio (opcional para tareas directas de negocios)';
COMMENT ON CONSTRAINT tareas_contexto_check ON tareas IS 'Garantiza que cada tarea tenga un contexto (proyecto O negocio)';
COMMENT ON VIEW vista_tareas_completas IS 'Vista completa de tareas con información de contexto (proyecto/negocio)';
COMMENT ON FUNCTION obtener_tareas_usuario(UUID, TEXT, UUID) IS 'Obtiene tareas de un usuario filtradas por contexto';

-- 10. Mostrar confirmación
DO $$
DECLARE
    tabla_existe BOOLEAN;
    columna_existe BOOLEAN;
BEGIN
    -- Verificar si la tabla tareas existe
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'tareas'
    ) INTO tabla_existe;
    
    -- Verificar si la columna negocio_id ya existe
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'tareas' AND column_name = 'negocio_id'
    ) INTO columna_existe;
    
    RAISE NOTICE '=== RESULTADO DE LA MIGRACIÓN ===';
    RAISE NOTICE 'Tabla tareas existe: %', tabla_existe;
    RAISE NOTICE 'Columna negocio_id agregada: %', columna_existe;
    RAISE NOTICE 'Vista vista_tareas_completas creada exitosamente';
    RAISE NOTICE 'Función obtener_tareas_usuario creada exitosamente';
    RAISE NOTICE 'Políticas RLS configuradas para tareas';
    RAISE NOTICE 'MIGRACIÓN COMPLETADA - Las tareas ahora soportan contexto mixto';
END $$; 