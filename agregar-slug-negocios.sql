-- =====================================================
-- 🏢 AGREGAR CAMPO SLUG A NEGOCIOS Y CAMPOS ADICIONALES
-- =====================================================

-- Agregar la columna slug a la tabla negocios
ALTER TABLE negocios 
ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;

-- Agregar campos adicionales para configuración completa
ALTER TABLE negocios 
ADD COLUMN IF NOT EXISTS website VARCHAR(255),
ADD COLUMN IF NOT EXISTS telefono VARCHAR(20),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS direccion TEXT,
ADD COLUMN IF NOT EXISTS numero_documento VARCHAR(50),
ADD COLUMN IF NOT EXISTS regimen_fiscal VARCHAR(50),
ADD COLUMN IF NOT EXISTS meta_ingresos_mensual DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS meta_gastos_mensual DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Crear un índice para el slug para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_negocios_slug ON negocios(slug);

-- Función para generar slug automáticamente
CREATE OR REPLACE FUNCTION generar_slug_negocio(nombre_negocio TEXT) 
RETURNS TEXT AS $$
DECLARE
    slug_base TEXT;
    slug_final TEXT;
    contador INTEGER := 1;
BEGIN
    -- Generar slug base
    slug_base := LOWER(TRIM(nombre_negocio));
    slug_base := REPLACE(slug_base, 'á', 'a');
    slug_base := REPLACE(slug_base, 'é', 'e');
    slug_base := REPLACE(slug_base, 'í', 'i');
    slug_base := REPLACE(slug_base, 'ó', 'o');
    slug_base := REPLACE(slug_base, 'ú', 'u');
    slug_base := REPLACE(slug_base, 'ñ', 'n');
    slug_base := REPLACE(slug_base, 'ç', 'c');
    slug_base := REGEXP_REPLACE(slug_base, '[^a-z0-9\s-]', '', 'g');
    slug_base := REGEXP_REPLACE(slug_base, '[\s_]+', '-', 'g');
    slug_base := REGEXP_REPLACE(slug_base, '-+', '-', 'g');
    slug_base := REGEXP_REPLACE(slug_base, '^-|-$', '', 'g');
    
    -- Si el slug está vacío, usar un valor por defecto
    IF slug_base = '' OR slug_base IS NULL THEN
        slug_base := 'negocio';
    END IF;
    
    -- Verificar unicidad y agregar contador si es necesario
    slug_final := slug_base;
    
    WHILE EXISTS (SELECT 1 FROM negocios WHERE slug = slug_final) LOOP
        slug_final := slug_base || '-' || contador;
        contador := contador + 1;
    END LOOP;
    
    RETURN slug_final;
END;
$$ LANGUAGE plpgsql;

-- Llenar slugs para negocios existentes
UPDATE negocios 
SET slug = generar_slug_negocio(nombre) 
WHERE slug IS NULL;

-- Hacer que el slug sea NOT NULL después de llenar los datos
ALTER TABLE negocios 
ALTER COLUMN slug SET NOT NULL;

-- Trigger para generar slug automáticamente en inserts/updates
CREATE OR REPLACE FUNCTION trigger_generar_slug_negocio() 
RETURNS TRIGGER AS $$
BEGIN
    -- Solo generar slug si no está presente o el nombre cambió
    IF TG_OP = 'INSERT' THEN
        IF NEW.slug IS NULL OR NEW.slug = '' THEN
            NEW.slug := generar_slug_negocio(NEW.nombre);
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.nombre != NEW.nombre AND (NEW.slug IS NULL OR NEW.slug = '') THEN
            NEW.slug := generar_slug_negocio(NEW.nombre);
        END IF;
        -- Actualizar fecha de modificación
        NEW.fecha_actualizacion := NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger si no existe
DROP TRIGGER IF EXISTS trigger_negocio_slug ON negocios;
CREATE TRIGGER trigger_negocio_slug
    BEFORE INSERT OR UPDATE ON negocios
    FOR EACH ROW
    EXECUTE FUNCTION trigger_generar_slug_negocio();

-- ✅ SCRIPT COMPLETO PARA CONFIGURACIÓN DE NEGOCIOS

-- Comentarios para documentación
COMMENT ON COLUMN negocios.slug IS 'Slug único generado automáticamente a partir del nombre del negocio para URLs amigables';
COMMENT ON FUNCTION generar_slug_negocio(TEXT) IS 'Genera un slug único y URL-friendly a partir del nombre del negocio';
COMMENT ON TRIGGER trigger_negocio_slug ON negocios IS 'Genera automáticamente el slug cuando se crea o actualiza un negocio';

-- Mostrar confirmación
DO $$
BEGIN
    RAISE NOTICE 'Campo slug agregado exitosamente a la tabla negocios';
    RAISE NOTICE 'Se han generado slugs para todos los negocios existentes';
    RAISE NOTICE 'Los nuevos negocios tendrán slugs generados automaticamente';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ¡LISTO! Ahora puedes usar URLs como:';
    RAISE NOTICE '   /panel/negocios/mi-tienda-online';
    RAISE NOTICE '   /panel/negocios/consultoria-digital';
    RAISE NOTICE '   /panel/negocios/academia-onlinefdx';
END $$; 