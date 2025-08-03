-- =====================================================
-- 🚀 FIX RÁPIDO PARA TAREAS - SIN ERRORES
-- =====================================================

-- 1. Verificar estructura actual
DO $$
DECLARE
    columna_negocio_existe BOOLEAN;
    constraint_existe BOOLEAN;
BEGIN
    -- Verificar si negocio_id ya existe
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'tareas' AND column_name = 'negocio_id'
    ) INTO columna_negocio_existe;
    
    IF NOT columna_negocio_existe THEN
        -- 2. Hacer proyecto_id opcional 
        ALTER TABLE tareas ALTER COLUMN proyecto_id DROP NOT NULL;
        
        -- 3. Agregar negocio_id
        ALTER TABLE tareas ADD COLUMN negocio_id UUID REFERENCES negocios(id) ON DELETE CASCADE;
        
        -- 4. Agregar constraint de validación
        ALTER TABLE tareas ADD CONSTRAINT tareas_contexto_check 
        CHECK (
            (proyecto_id IS NOT NULL AND negocio_id IS NULL) OR 
            (proyecto_id IS NULL AND negocio_id IS NOT NULL)
        );
        
        -- 5. Crear índices
        CREATE INDEX idx_tareas_negocio_id ON tareas(negocio_id);
        
        RAISE NOTICE '✅ Tabla tareas actualizada exitosamente';
        RAISE NOTICE '✅ Columna negocio_id agregada';
        RAISE NOTICE '✅ Constraint de validación agregado';
        RAISE NOTICE '✅ Índices creados';
    ELSE
        RAISE NOTICE '✅ La tabla tareas ya está actualizada';
    END IF;
    
    -- 6. Verificar políticas RLS
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'tareas' AND policyname = 'Usuarios pueden ver sus propias tareas'
    ) THEN
        -- Habilitar RLS
        ALTER TABLE tareas ENABLE ROW LEVEL SECURITY;
        
        -- Políticas básicas
        CREATE POLICY "Usuarios pueden ver sus propias tareas" ON tareas
            FOR SELECT USING (auth.uid() = usuario_id);
            
        CREATE POLICY "Usuarios pueden crear sus propias tareas" ON tareas
            FOR INSERT WITH CHECK (auth.uid() = usuario_id);
            
        CREATE POLICY "Usuarios pueden actualizar sus propias tareas" ON tareas
            FOR UPDATE USING (auth.uid() = usuario_id);
            
        CREATE POLICY "Usuarios pueden eliminar sus propias tareas" ON tareas
            FOR DELETE USING (auth.uid() = usuario_id);
            
        RAISE NOTICE '✅ Políticas RLS configuradas';
    ELSE
        RAISE NOTICE '✅ Políticas RLS ya existen';
    END IF;
    
END $$;

-- 7. Verificar resultado final
DO $$
DECLARE
    total_columnas INTEGER;
    tiene_negocio_id BOOLEAN;
    tiene_constraint BOOLEAN;
BEGIN
    -- Contar columnas
    SELECT COUNT(*) FROM information_schema.columns 
    WHERE table_name = 'tareas' INTO total_columnas;
    
    -- Verificar negocio_id
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'tareas' AND column_name = 'negocio_id'
    ) INTO tiene_negocio_id;
    
    -- Verificar constraint
    SELECT EXISTS (
        SELECT FROM information_schema.constraint_column_usage 
        WHERE table_name = 'tareas' AND constraint_name = 'tareas_contexto_check'
    ) INTO tiene_constraint;
    
    RAISE NOTICE '=== 📊 RESULTADO FINAL ===';
    RAISE NOTICE 'Total columnas en tareas: %', total_columnas;
    RAISE NOTICE 'Tiene negocio_id: %', tiene_negocio_id;
    RAISE NOTICE 'Tiene constraint: %', tiene_constraint;
    
    IF tiene_negocio_id AND tiene_constraint THEN
        RAISE NOTICE '🎉 ¡ÉXITO! La tabla tareas está lista para tareas mixtas';
    ELSE
        RAISE NOTICE '❌ Algo salió mal, revisar manualmente';
    END IF;
    
END $$; 