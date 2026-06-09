-- ============================================================
-- NutriDashboard — Supabase Schema
-- ============================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- 1. Grupos de alimentos
-- ------------------------------------------------------------
CREATE TABLE grupos_alimentos (
  id        SERIAL PRIMARY KEY,
  nombre    TEXT NOT NULL UNIQUE,         -- 'Verduras', 'Frutas', etc.
  color_hex TEXT DEFAULT '#94a3b8'        -- color para UI
);

-- ------------------------------------------------------------
-- 2. Catálogo de alimentos (equivalentes)
-- ------------------------------------------------------------
CREATE TABLE alimentos (
  id             SERIAL PRIMARY KEY,
  grupo_id       INTEGER NOT NULL REFERENCES grupos_alimentos(id) ON DELETE RESTRICT,
  nombre         TEXT NOT NULL,
  porcion_texto  TEXT NOT NULL,           -- ej. '1/3 taza', '30g', '1 pieza'
  porcion_gramos NUMERIC(8,2) NOT NULL,   -- gramos por 1 porción/equivalente
  notas          TEXT
);

-- ------------------------------------------------------------
-- 3. Momentos del día (catálogo fijo)
-- ------------------------------------------------------------
CREATE TABLE momentos_dia (
  id     SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,            -- 'Colación 1', 'Desayuno', etc.
  hora   TIME NOT NULL                    -- 07:00, 11:00, 16:00, 17:00, 20:00
);

-- ------------------------------------------------------------
-- 4. Distribución diaria de porciones por momento
--    Cada fila = un momento + cuántas porciones de cada grupo
-- ------------------------------------------------------------
CREATE TABLE distribucion_diaria (
  id                   SERIAL PRIMARY KEY,
  momento_id           INTEGER NOT NULL REFERENCES momentos_dia(id) ON DELETE CASCADE,
  verduras             NUMERIC(4,1) DEFAULT 0,
  frutas               NUMERIC(4,1) DEFAULT 0,
  cereales             NUMERIC(4,1) DEFAULT 0,
  leguminosas          NUMERIC(4,1) DEFAULT 0,
  proteinas            NUMERIC(4,1) DEFAULT 0,
  leche                NUMERIC(4,1) DEFAULT 0,
  grasas               NUMERIC(4,1) DEFAULT 0,
  UNIQUE (momento_id)
);

-- ------------------------------------------------------------
-- 5. Recetas
-- ------------------------------------------------------------
CREATE TABLE recetas (
  id          SERIAL PRIMARY KEY,
  nombre      TEXT NOT NULL,
  momento_id  INTEGER REFERENCES momentos_dia(id) ON DELETE SET NULL,
  dia_semana  SMALLINT CHECK (dia_semana BETWEEN 1 AND 7),  -- 1=Lunes…7=Domingo
  imagen_url  TEXT,
  notas       TEXT
);

-- Índice para consultas por día/momento
CREATE INDEX idx_recetas_dia_momento ON recetas(dia_semana, momento_id);

-- ------------------------------------------------------------
-- 6. Ingredientes de cada receta (mapeo a catálogo)
-- ------------------------------------------------------------
CREATE TABLE receta_ingredientes (
  id          SERIAL PRIMARY KEY,
  receta_id   INTEGER NOT NULL REFERENCES recetas(id) ON DELETE CASCADE,
  alimento_id INTEGER NOT NULL REFERENCES alimentos(id) ON DELETE RESTRICT,
  porciones   NUMERIC(6,2) NOT NULL,      -- número de equivalentes usados
  notas       TEXT                        -- 'cocido', 'crudo', etc.
);

-- ------------------------------------------------------------
-- 7. Vistas útiles
-- ------------------------------------------------------------

-- Vista: ingredientes con gramos calculados
CREATE OR REPLACE VIEW v_receta_ingredientes AS
SELECT
  ri.receta_id,
  r.nombre                                          AS receta,
  a.nombre                                          AS alimento,
  g.nombre                                          AS grupo,
  g.color_hex,
  ri.porciones,
  a.porcion_gramos,
  ROUND(ri.porciones * a.porcion_gramos, 1)        AS gramos_totales,
  a.porcion_texto,
  ri.notas
FROM receta_ingredientes ri
JOIN recetas    r ON r.id = ri.receta_id
JOIN alimentos  a ON a.id = ri.alimento_id
JOIN grupos_alimentos g ON g.id = a.grupo_id;

-- Vista: porciones consumidas por receta vs distribución del momento
CREATE OR REPLACE VIEW v_porciones_por_receta AS
SELECT
  rec.id        AS receta_id,
  rec.nombre    AS receta,
  rec.momento_id,
  m.nombre      AS momento,
  m.hora,
  rec.dia_semana,
  COALESCE(SUM(CASE WHEN g.nombre = 'Verduras'     THEN ri.porciones ELSE 0 END), 0) AS verduras,
  COALESCE(SUM(CASE WHEN g.nombre = 'Frutas'       THEN ri.porciones ELSE 0 END), 0) AS frutas,
  COALESCE(SUM(CASE WHEN g.nombre = 'Cereales'     THEN ri.porciones ELSE 0 END), 0) AS cereales,
  COALESCE(SUM(CASE WHEN g.nombre = 'Leguminosas'  THEN ri.porciones ELSE 0 END), 0) AS leguminosas,
  COALESCE(SUM(CASE WHEN g.nombre = 'Proteínas'    THEN ri.porciones ELSE 0 END), 0) AS proteinas,
  COALESCE(SUM(CASE WHEN g.nombre = 'Leche'        THEN ri.porciones ELSE 0 END), 0) AS leche,
  COALESCE(SUM(CASE WHEN g.nombre = 'Grasas'       THEN ri.porciones ELSE 0 END), 0) AS grasas
FROM recetas rec
JOIN momentos_dia m ON m.id = rec.momento_id
LEFT JOIN receta_ingredientes ri ON ri.receta_id = rec.id
LEFT JOIN alimentos a ON a.id = ri.alimento_id
LEFT JOIN grupos_alimentos g ON g.id = a.grupo_id
GROUP BY rec.id, rec.nombre, rec.momento_id, m.nombre, m.hora, rec.dia_semana;
