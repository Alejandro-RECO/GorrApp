-- migrations/009_realtime_publications.sql
-- Módulo: Notificaciones en tiempo real
-- Descripción: Habilitar Supabase Realtime en las tablas que generan notificaciones
-- Fecha: 2026-05-06
--
-- EJECUTAR EN SUPABASE DASHBOARD → SQL Editor → Run
-- Sin esto las suscripciones Realtime no reciben ningún evento.

ALTER PUBLICATION supabase_realtime ADD TABLE clientes;
ALTER PUBLICATION supabase_realtime ADD TABLE ventas;
ALTER PUBLICATION supabase_realtime ADD TABLE abonos;
ALTER PUBLICATION supabase_realtime ADD TABLE compras_inventario;
