-- Recrear vista con grupo_id y alimento_id expuestos
DROP VIEW IF EXISTS v_receta_ingredientes;
DROP VIEW IF EXISTS v_porciones_por_receta;

CREATE VIEW v_receta_ingredientes AS
SELECT
  ri.receta_id,
  ri.alimento_id,
  r.nombre                                          AS receta,
  a.nombre                                          AS alimento,
  g.id                                              AS grupo_id,
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

CREATE VIEW v_porciones_por_receta AS
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

-- RLS para las vistas
ALTER VIEW v_receta_ingredientes OWNER TO postgres;
ALTER VIEW v_porciones_por_receta OWNER TO postgres;
