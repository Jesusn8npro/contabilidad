-- Agregar columna WhatsApp a la tabla negocios
-- Ejecutar este SQL en Supabase SQL Editor

-- 1. Agregar columna whatsapp
ALTER TABLE negocios 
ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20);

-- 2. Agregar comentario descriptivo
COMMENT ON COLUMN negocios.whatsapp IS 'Número de WhatsApp del negocio para contacto directo';

-- 3. Crear índice para búsquedas rápidas (opcional)
CREATE INDEX IF NOT EXISTS idx_negocios_whatsapp ON negocios(whatsapp) 
WHERE whatsapp IS NOT NULL;

-- 4. Verificar que se agregó correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'negocios' 
  AND column_name = 'whatsapp';

-- 5. Ejemplo de actualización (opcional - solo para pruebas)
-- UPDATE negocios 
-- SET whatsapp = '+57 300 123 4567' 
-- WHERE id = 'tu-id-de-negocio-aqui';

-- 6. Verificar datos (opcional)
-- SELECT id, nombre, telefono, whatsapp 
-- FROM negocios 
-- WHERE usuario_id = auth.uid(); 