# Migraciones de Supabase

## Flujo

1. Crear archivo con formato: `YYYYMMDDHHMMSS_descripcion.sql`
2. Aplicar en Supabase Dashboard > SQL Editor, o con CLI:
   ```
   npx supabase db push --project-id cwphowtjsowyovikupqj
   ```
3. Regenerar tipos después de cada migración:
   ```
   npx supabase gen types typescript --project-id cwphowtjsowyovikupqj --schema public > src/shared/types/supabase.types.ts
   ```
4. Commitear migración + tipos juntos en el mismo commit.

## Convención de nombres

```
20260422000000_init_schema.sql
20260425000000_add_ventas_table.sql
```

## Reglas

- Una migración = un cambio lógico
- Nunca modificar una migración ya aplicada en producción
- Siempre incluir comentario con HU que motivó el cambio
