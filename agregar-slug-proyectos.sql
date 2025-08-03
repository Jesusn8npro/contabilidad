-- =====================================================
-- 🏷️ AGREGAR CAMPO SLUG A PROYECTOS
-- =====================================================

-- Agregar la columna slug a la tabla proyectos
ALTER TABLE proyectos 
ADD COLUMN slug VARCHAR(255) UNIQUE;

-- Crear un índice para el slug para mejorar el rendimiento
CREATE INDEX idx_proyectos_slug ON proyectos(slug);

-- Función para generar slug automáticamente
CREATE OR REPLACE FUNCTION generar_slug_proyecto(nombre_proyecto TEXT) 
RETURNS TEXT AS $$
DECLARE
    slug_base TEXT;
    slug_final TEXT;
    contador INTEGER := 1;
BEGIN
    -- Generar slug base
    slug_base := LOWER(TRIM(nombre_proyecto));
    slug_base := REPLACE(slug_base, 'á', 'a');
    slug_base := REPLACE(slug_base, 'é', 'e');
    slug_base := REPLACE(slug_base, 'í', 'i');
    slug_base := REPLACE(slug_base, 'ó', 'o');
    slug_base := REPLACE(slug_base, 'ú', 'u');
    slug_base := REPLACE(slug_base, 'ñ', 'n');
    slug_base := REGEXP_REPLACE(slug_base, '[^a-z0-9\s-]', '', 'g');
    slug_base := REGEXP_REPLACE(slug_base, '[\s_]+', '-', 'g');
    slug_base := REGEXP_REPLACE(slug_base, '-+', '-', 'g');
    slug_base := REGEXP_REPLACE(slug_base, '^-|-$', '', 'g');
    
    -- Si el slug está vacío, usar un valor por defecto
    IF slug_base = '' OR slug_base IS NULL THEN
        slug_base := 'proyecto';
    END IF;
    
    -- Verificar unicidad y agregar contador si es necesario
    slug_final := slug_base;
    
    WHILE EXISTS (SELECT 1 FROM proyectos WHERE slug = slug_final) LOOP
        slug_final := slug_base || '-' || contador;
        contador := contador + 1;
    END LOOP;
    
    RETURN slug_final;
END;
$$ LANGUAGE plpgsql;

-- Llenar slugs para proyectos existentes
UPDATE proyectos 
SET slug = generar_slug_proyecto(nombre) 
WHERE slug IS NULL;

-- Hacer que el slug sea NOT NULL después de llenar los datos
ALTER TABLE proyectos 
ALTER COLUMN slug SET NOT NULL;

-- Trigger para generar slug automáticamente en nuevos proyectos
CREATE OR REPLACE FUNCTION trigger_generar_slug_proyecto() 
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generar_slug_proyecto(NEW.nombre);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar el trigger
CREATE TRIGGER trigger_proyecto_slug
    BEFORE INSERT OR UPDATE ON proyectos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_generar_slug_proyecto();

-- Comentarios para documentación
COMMENT ON COLUMN proyectos.slug IS 'Slug único generado automáticamente a partir del nombre del proyecto para URLs amigables';
COMMENT ON FUNCTION generar_slug_proyecto(TEXT) IS 'Genera un slug único y URL-friendly a partir del nombre del proyecto';
COMMENT ON TRIGGER trigger_proyecto_slug ON proyectos IS 'Genera automáticamente el slug cuando se crea o actualiza un proyecto';

-- Mostrar confirmación
DO $$
BEGIN
    RAISE NOTICE 'Campo slug agregado exitosamente a la tabla proyectos';
    RAISE NOTICE 'Se han generado slugs para todos los proyectos existentes';
    RAISE NOTICE 'Los nuevos proyectos tendrán slugs generados automaticamente';
END $$; 