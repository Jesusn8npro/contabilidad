-- =====================================================
-- 🔍 DEBUG: VERIFICAR ESTADO DE TAREAS
-- =====================================================

-- 1. Verificar estructura de la tabla tareas
SELECT 
    'COLUMNAS DE TAREAS' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tareas'
ORDER BY ordinal_position;

-- 2. Verificar constraints
SELECT 
    'CONSTRAINTS' as info,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'tareas';

-- 3. Verificar políticas RLS
SELECT 
    'POLÍTICAS RLS' as info,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'tareas';

-- 4. Verificar si RLS está habilitado
SELECT 
    'RLS STATUS' as info,
    tablename,
    rowsecurity,
    forcerowsecurity
FROM pg_tables 
WHERE tablename = 'tareas';

-- 5. Contar tareas existentes
SELECT 
    'TOTAL TAREAS' as info,
    COUNT(*) as total
FROM tareas;

-- 6. Verificar últimos errores de auth
SELECT 
    'USUARIO ACTUAL' as info,
    auth.uid() as user_id;

-- 7. Verificar si hay proyectos
SELECT 
    'TOTAL PROYECTOS' as info,
    COUNT(*) as total
FROM proyectos;

-- 8. Intentar insertar una tarea de prueba (sin ejecutar)
-- Esta query NO se ejecuta, solo muestra lo que se intentaría hacer
SELECT 
    'QUERY DE PRUEBA (NO EJECUTADA)' as info,
    $tarea_prueba$
    INSERT INTO tareas (
        usuario_id,
        proyecto_id,
        titulo,
        descripcion,
        estado,
        prioridad,
        fecha_creacion,
        fecha_actualizacion,
        orden,
        columna
    ) VALUES (
        auth.uid(),
        (SELECT id FROM proyectos LIMIT 1),
        'Tarea de prueba',
        'Descripción de prueba',
        'por-hacer',
        'media',
        NOW(),
        NOW(),
        1,
        'por-hacer'
    )
    $tarea_prueba$ as query_prueba; 