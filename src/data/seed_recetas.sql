-- ============================================================
-- NutriDashboard — Plan Semanal Completo
-- Ejecutar DESPUÉS de schema.sql y seed.sql
-- ============================================================

-- Limpiar recetas existentes
DELETE FROM receta_ingredientes;
DELETE FROM recetas;

-- ============================================================
-- 1. Corregir porcion_gramos con valores oficiales del plan
-- ============================================================
UPDATE alimentos SET porcion_gramos = 47,  porcion_texto = '1/4 taza'       WHERE nombre = 'Arroz cocido';
UPDATE alimentos SET porcion_gramos = 44,  porcion_texto = '1 pieza'         WHERE nombre = 'Huevo entero';
UPDATE alimentos SET porcion_gramos = 66,  porcion_texto = '2 piezas'        WHERE nombre = 'Clara de huevo';
UPDATE alimentos SET porcion_gramos = 42,  porcion_texto = '3 cucharadas'    WHERE nombre = 'Requesón';
UPDATE alimentos SET porcion_gramos = 40,  porcion_texto = '40g'             WHERE nombre = 'Queso panela';
UPDATE alimentos SET porcion_gramos = 40,  porcion_texto = '40g cocido'      WHERE nombre = 'Pescado blanco';
UPDATE alimentos SET porcion_gramos = 30,  porcion_texto = '30g cocida'      WHERE nombre = 'Pechuga de pollo';
UPDATE alimentos SET porcion_gramos = 124, porcion_texto = '3/4 taza'        WHERE nombre = 'Papaya'; -- seed uses 120 wrong
UPDATE alimentos SET porcion_gramos = 140, porcion_texto = '1 taza'
  WHERE nombre = 'Papaya' AND porcion_gramos != 140;
-- Fix individual alimentos
UPDATE alimentos SET porcion_gramos = 140  WHERE nombre = 'Papaya';
UPDATE alimentos SET porcion_gramos = 124  WHERE nombre = 'Papaya'; -- wait, 1 taza papaya = 140g per equivalentes list
-- Correction based on official list
UPDATE alimentos SET porcion_gramos = 140, porcion_texto = '1 taza'          WHERE nombre = 'Papaya';
UPDATE alimentos SET porcion_gramos = 124, porcion_texto = '3/4 taza'        WHERE nombre = 'Piña';
UPDATE alimentos SET porcion_gramos = 106, porcion_texto = '1 pieza'         WHERE nombre = 'Manzana';
UPDATE alimentos SET porcion_gramos = 152, porcion_texto = '2 piezas'        WHERE nombre = 'Naranja';
UPDATE alimentos SET porcion_gramos = 54,  porcion_texto = '1/2 pieza'       WHERE nombre = 'Plátano';
UPDATE alimentos SET porcion_gramos = 166, porcion_texto = '1 taza'          WHERE nombre = 'Fresa';
UPDATE alimentos SET porcion_gramos = 134, porcion_texto = '2 piezas crudas' WHERE nombre = 'Nopal';
UPDATE alimentos SET porcion_gramos = 104, porcion_texto = '1 taza'          WHERE nombre = 'Pepino';
UPDATE alimentos SET porcion_gramos = 120, porcion_texto = '2 tazas'         WHERE nombre = 'Espinaca';
UPDATE alimentos SET porcion_gramos = 135, porcion_texto = '3 tazas'         WHERE nombre = 'Lechuga';
UPDATE alimentos SET porcion_gramos = 91,  porcion_texto = '1 pieza',
                     nombre = 'Calabacita'                                    WHERE nombre IN ('Calabaza','Calabacita');
UPDATE alimentos SET porcion_gramos = 92,  porcion_texto = '1/2 taza cocido' WHERE nombre = 'Brócoli';
-- Unificar frijol
UPDATE alimentos SET nombre = 'Frijol cocido', porcion_texto = '1/2 taza', porcion_gramos = 86
  WHERE nombre = 'Frijoles negros cocidos';

-- ============================================================
-- 2. Agregar alimentos faltantes (ON CONFLICT DO NOTHING si ya existen)
-- ============================================================

-- Verduras faltantes
INSERT INTO alimentos (grupo_id, nombre, porcion_texto, porcion_gramos)
SELECT g.id, n.nombre, n.texto, n.gramos
FROM grupos_alimentos g,
(VALUES
  ('Cebolla morada/blanca', '1/2 taza',         58),
  ('Nopal cocido',          '1 taza',           149),
  ('Mix de vegetales verdes','1 taza',           192),
  ('Puré de tomate',        '1/4 taza',          63),
  ('Jitomate',              '1 pieza',           113),
  ('Brócoli cocido',        '1/2 taza',          92)
) AS n(nombre, texto, gramos)
WHERE g.nombre = 'Verduras'
  AND NOT EXISTS (SELECT 1 FROM alimentos WHERE nombre = n.nombre);

-- Frutas faltantes
INSERT INTO alimentos (grupo_id, nombre, porcion_texto, porcion_gramos)
SELECT g.id, n.nombre, n.texto, n.gramos
FROM grupos_alimentos g,
(VALUES
  ('Mandarina', '2 piezas', 128),
  ('Mango',     '1 taza',   165),
  ('Mora',      '3/4 taza', 108),
  ('Piña',      '3/4 taza', 124)
) AS n(nombre, texto, gramos)
WHERE g.nombre = 'Frutas'
  AND NOT EXISTS (SELECT 1 FROM alimentos WHERE nombre = n.nombre);

-- Cereales faltantes
INSERT INTO alimentos (grupo_id, nombre, porcion_texto, porcion_gramos)
SELECT g.id, n.nombre, n.texto, n.gramos
FROM grupos_alimentos g,
(VALUES
  ('Galleta salma',          '1 paquete',    18),
  ('Pan árabe integral',     '1/3 pieza',    21),
  ('Bolillo/birote sin migajón', '1/3 pieza', 20),
  ('Pasta integral cocida',  '1/3 taza',     46),
  ('Arroz integral cocido',  '1/3 taza',     65),
  ('Quinoa cruda',           '20g',          20)
) AS n(nombre, texto, gramos)
WHERE g.nombre = 'Cereales'
  AND NOT EXISTS (SELECT 1 FROM alimentos WHERE nombre = n.nombre);

-- Proteínas faltantes
INSERT INTO alimentos (grupo_id, nombre, porcion_texto, porcion_gramos)
SELECT g.id, n.nombre, n.texto, n.gramos
FROM grupos_alimentos g,
(VALUES
  ('Jamón bajo en grasa', '2 rebanadas', 42),
  ('Queso cottage',       '3 cucharadas', 48)
) AS n(nombre, texto, gramos)
WHERE g.nombre = 'Proteínas'
  AND NOT EXISTS (SELECT 1 FROM alimentos WHERE nombre = n.nombre);

-- Leche faltante
INSERT INTO alimentos (grupo_id, nombre, porcion_texto, porcion_gramos)
SELECT g.id, n.nombre, n.texto, n.gramos
FROM grupos_alimentos g,
(VALUES
  ('Leche deslactosada light',      '1 taza (240ml)', 240),
  ('Sustituto lácteo de almendra',  '1 taza (240ml)', 240),
  ('Yogurt deslactosado',           '1 pieza (250g)', 250)
) AS n(nombre, texto, gramos)
WHERE g.nombre = 'Leche'
  AND NOT EXISTS (SELECT 1 FROM alimentos WHERE nombre = n.nombre);

-- Grasas faltantes
INSERT INTO alimentos (grupo_id, nombre, porcion_texto, porcion_gramos)
SELECT g.id, n.nombre, n.texto, n.gramos
FROM grupos_alimentos g,
(VALUES
  ('Aceite en spray',   '5 disparos (1 seg)', 5),
  ('Crema',             '1 cucharada',        15),
  ('Linaza molida',     '1 cucharada',         9),
  ('Pepita de calabaza','1.5 cucharadas',      12),
  ('Vinagreta',         '1/2 cucharada',        8)
) AS n(nombre, texto, gramos)
WHERE g.nombre = 'Grasas'
  AND NOT EXISTS (SELECT 1 FROM alimentos WHERE nombre = n.nombre);

-- ============================================================
-- 3. Insertar 35 recetas (7 días × 5 momentos)
-- ============================================================

-- COLACIÓN 1 (7:00)
INSERT INTO recetas (nombre, momento_id, dia_semana, notas) VALUES
  ('Jugo Verde',                 (SELECT id FROM momentos_dia WHERE nombre='Colación 1'), 1, 'Nopal, pepino, avena, piña, mandarina, aceite de oliva'),
  ('Batido de Papaya y Fresa',   (SELECT id FROM momentos_dia WHERE nombre='Colación 1'), 2, 'Mezcla todos los ingredientes con un poco de agua'),
  ('Jugo de Manzana',            (SELECT id FROM momentos_dia WHERE nombre='Colación 1'), 3, 'Licua todos los ingredientes con agua al gusto'),
  ('Avena Preparada Alta en Fibra',(SELECT id FROM momentos_dia WHERE nombre='Colación 1'),4,'Avena + linaza + fruta picada + zanahoria + pepitas'),
  ('Jugo Verde',                 (SELECT id FROM momentos_dia WHERE nombre='Colación 1'), 5, 'Nopal, pepino, avena, piña, mandarina, aceite de oliva'),
  ('Batido de Papaya y Fresa',   (SELECT id FROM momentos_dia WHERE nombre='Colación 1'), 6, 'Mezcla todos los ingredientes con un poco de agua'),
  ('Jugo de Manzana',            (SELECT id FROM momentos_dia WHERE nombre='Colación 1'), 7, 'Licua todos los ingredientes con agua al gusto');

-- DESAYUNO (11:00)
INSERT INTO recetas (nombre, momento_id, dia_semana, notas) VALUES
  ('Chilaquiles Salmas con Frijoles y Requesón',(SELECT id FROM momentos_dia WHERE nombre='Desayuno'),1,'Galletas salmas bañadas en puré de tomate, crema, huevo, frijoles con requesón'),
  ('Burrito de Frijoles',        (SELECT id FROM momentos_dia WHERE nombre='Desayuno'), 2, 'Pan árabe con pollo, frijoles, espinaca, jitomate, calabacita y aguacate'),
  ('Huevos Revueltos con Nopales',(SELECT id FROM momentos_dia WHERE nombre='Desayuno'),3,'Huevo + nopales + jitomate, acompañado de frijoles y galletas salmas'),
  ('Lonche Completo',            (SELECT id FROM momentos_dia WHERE nombre='Desayuno'), 4, 'Bolillo con jamón, panela, aguacate, frijoles y verduras'),
  ('Chilaquiles Salmas con Frijoles y Requesón',(SELECT id FROM momentos_dia WHERE nombre='Desayuno'),5,'Galletas salmas bañadas en puré de tomate, crema, huevo, frijoles con requesón'),
  ('Burrito de Frijoles',        (SELECT id FROM momentos_dia WHERE nombre='Desayuno'), 6, 'Pan árabe con pollo, frijoles, espinaca, jitomate, calabacita y aguacate'),
  ('Huevos Revueltos con Nopales',(SELECT id FROM momentos_dia WHERE nombre='Desayuno'),7,'Huevo + nopales + jitomate, acompañado de frijoles y galletas salmas');

-- COMIDA (16:00)
INSERT INTO recetas (nombre, momento_id, dia_semana, notas) VALUES
  ('Filete de Pollo con Vegetales',(SELECT id FROM momentos_dia WHERE nombre='Comida'),1,'Pollo salteado con aceite, arroz, pepino, mix de vegetales y piña de postre'),
  ('Fajitas de Pollo a la Mostaza & Tajin',(SELECT id FROM momentos_dia WHERE nombre='Comida'),2,'Pollo marinado en yogurt+mostaza+tajin, quinoa y ensalada de fresa con vinagreta'),
  ('Pasta con Brócoli y Pollo',  (SELECT id FROM momentos_dia WHERE nombre='Comida'), 3, 'Pasta integral con pollo, brócoli y crema. Acompañar con naranjada'),
  ('Pescado Mojo de Ajo con Vegetales',(SELECT id FROM momentos_dia WHERE nombre='Comida'),4,'Pescado con ajo en aceite de oliva, arroz integral, mix de vegetales y naranjada'),
  ('Filete de Pollo con Vegetales',(SELECT id FROM momentos_dia WHERE nombre='Comida'),5,'Pollo salteado con aceite, arroz, pepino, mix de vegetales y piña de postre'),
  ('Fajitas de Pollo a la Mostaza & Tajin',(SELECT id FROM momentos_dia WHERE nombre='Comida'),6,'Pollo marinado en yogurt+mostaza+tajin, quinoa y ensalada de fresa con vinagreta'),
  ('Pasta con Brócoli y Pollo',  (SELECT id FROM momentos_dia WHERE nombre='Comida'), 7, 'Pasta integral con pollo, brócoli y crema. Acompañar con naranjada');

-- COLACIÓN 2 (17:00)
INSERT INTO recetas (nombre, momento_id, dia_semana, notas) VALUES
  ('Mango',                       (SELECT id FROM momentos_dia WHERE nombre='Colación 2'), 1, 'Tomar la porción indicada'),
  ('Naranja',                     (SELECT id FROM momentos_dia WHERE nombre='Colación 2'), 2, 'Partir por mitad y retirar gajos'),
  ('Manzana con Limón y Sal',     (SELECT id FROM momentos_dia WHERE nombre='Colación 2'), 3, 'Cortar en cubos, añadir limón y sal'),
  ('Mango',                       (SELECT id FROM momentos_dia WHERE nombre='Colación 2'), 4, 'Tomar la porción indicada'),
  ('Naranja',                     (SELECT id FROM momentos_dia WHERE nombre='Colación 2'), 5, 'Partir por mitad y retirar gajos'),
  ('Manzana con Limón y Sal',     (SELECT id FROM momentos_dia WHERE nombre='Colación 2'), 6, 'Cortar en cubos, añadir limón y sal'),
  ('Mango',                       (SELECT id FROM momentos_dia WHERE nombre='Colación 2'), 7, 'Tomar la porción indicada');

-- CENA (20:00)
INSERT INTO recetas (nombre, momento_id, dia_semana, notas) VALUES
  ('Toast con Licuado Verde',     (SELECT id FROM momentos_dia WHERE nombre='Cena'), 1, 'Pan tostado con aguacate y requesón + licuado de leche almendra, papaya y espinaca'),
  ('Mollete Salado',              (SELECT id FROM momentos_dia WHERE nombre='Cena'), 2, 'Bolillo con panela horneado + pico de gallo + licuado de leche, plátano y nuez'),
  ('Tacos de Nopales y Fruta',    (SELECT id FROM momentos_dia WHERE nombre='Cena'), 3, 'Tortillas con nopales a la mexicana y aguacate + papaya con cottage + yogurt'),
  ('Sandwich de Huevo con Licuado',(SELECT id FROM momentos_dia WHERE nombre='Cena'),4,'Pan integral con huevo, aguacate y mix de vegetales + licuado de leche y manzana'),
  ('Toast con Licuado Verde',     (SELECT id FROM momentos_dia WHERE nombre='Cena'), 5, 'Pan tostado con aguacate y requesón + licuado de leche almendra, papaya y espinaca'),
  ('Mollete Salado',              (SELECT id FROM momentos_dia WHERE nombre='Cena'), 6, 'Bolillo con panela horneado + pico de gallo + licuado de leche, plátano y nuez'),
  ('Tacos de Nopales y Fruta',    (SELECT id FROM momentos_dia WHERE nombre='Cena'), 7, 'Tortillas con nopales a la mexicana y aguacate + papaya con cottage + yogurt');

-- ============================================================
-- 4. Ingredientes por receta
-- Fórmula: porciones = gramos_receta / porcion_gramos_equivalente
-- ============================================================

-- Helper macro:
-- INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones, notas)
-- SELECT r.id, a.id, <n>, NULL
-- FROM recetas r JOIN alimentos a ON a.nombre = '<alim>'
-- WHERE r.nombre = '<receta>' AND r.dia_semana = <dia>;


-- ── JUGO VERDE (Lunes=1, Viernes=5) ────────────────────────
DO $$
DECLARE dias INT[] := ARRAY[1, 5];
        dia  INT;
BEGIN
  FOREACH dia IN ARRAY dias LOOP
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Avena en hojuela cruda'  WHERE r.nombre='Jugo Verde' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 0.5  FROM recetas r JOIN alimentos a ON a.nombre='Piña'                    WHERE r.nombre='Jugo Verde' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 0.5  FROM recetas r JOIN alimentos a ON a.nombre='Mandarina'               WHERE r.nombre='Jugo Verde' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1.5  FROM recetas r JOIN alimentos a ON a.nombre='Aceite de oliva'         WHERE r.nombre='Jugo Verde' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 0.5  FROM recetas r JOIN alimentos a ON a.nombre='Nopal'                   WHERE r.nombre='Jugo Verde' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 0.5  FROM recetas r JOIN alimentos a ON a.nombre='Pepino'                  WHERE r.nombre='Jugo Verde' AND r.dia_semana=dia;
  END LOOP;
END $$;

-- ── BATIDO DE PAPAYA Y FRESA (Martes=2, Sábado=6) ──────────
DO $$
DECLARE dias INT[] := ARRAY[2, 6];
        dia  INT;
BEGIN
  FOREACH dia IN ARRAY dias LOOP
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Avena en hojuela cruda'  WHERE r.nombre='Batido de Papaya y Fresa' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 0.5  FROM recetas r JOIN alimentos a ON a.nombre='Fresa'                   WHERE r.nombre='Batido de Papaya y Fresa' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 0.5  FROM recetas r JOIN alimentos a ON a.nombre='Papaya'                  WHERE r.nombre='Batido de Papaya y Fresa' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1.5  FROM recetas r JOIN alimentos a ON a.nombre='Semillas de chía'        WHERE r.nombre='Batido de Papaya y Fresa' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Nopal'                   WHERE r.nombre='Batido de Papaya y Fresa' AND r.dia_semana=dia;
  END LOOP;
END $$;

-- ── JUGO DE MANZANA (Miércoles=3, Domingo=7) ───────────────
DO $$
DECLARE dias INT[] := ARRAY[3, 7];
        dia  INT;
BEGIN
  FOREACH dia IN ARRAY dias LOOP
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Avena en hojuela cruda'  WHERE r.nombre='Jugo de Manzana' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Manzana'                 WHERE r.nombre='Jugo de Manzana' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1.5  FROM recetas r JOIN alimentos a ON a.nombre='Linaza molida'           WHERE r.nombre='Jugo de Manzana' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Pepino'                  WHERE r.nombre='Jugo de Manzana' AND r.dia_semana=dia;
  END LOOP;
END $$;

-- ── AVENA ALTA EN FIBRA (Jueves=4) ─────────────────────────
INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Avena en hojuela cruda'  WHERE r.nombre='Avena Preparada Alta en Fibra' AND r.dia_semana=4;
INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
SELECT r.id, a.id, 0.5  FROM recetas r JOIN alimentos a ON a.nombre='Papaya'                  WHERE r.nombre='Avena Preparada Alta en Fibra' AND r.dia_semana=4;
INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
SELECT r.id, a.id, 0.5  FROM recetas r JOIN alimentos a ON a.nombre='Mora'                    WHERE r.nombre='Avena Preparada Alta en Fibra' AND r.dia_semana=4;
INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
SELECT r.id, a.id, 0.75 FROM recetas r JOIN alimentos a ON a.nombre='Pepita de calabaza'      WHERE r.nombre='Avena Preparada Alta en Fibra' AND r.dia_semana=4;
INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
SELECT r.id, a.id, 0.75 FROM recetas r JOIN alimentos a ON a.nombre='Linaza molida'           WHERE r.nombre='Avena Preparada Alta en Fibra' AND r.dia_semana=4;
INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Zanahoria'               WHERE r.nombre='Avena Preparada Alta en Fibra' AND r.dia_semana=4;

-- ── CHILAQUILES SALMAS (Lunes=1, Viernes=5) ────────────────
DO $$
DECLARE dias INT[] := ARRAY[1, 5];
        dia  INT;
BEGIN
  FOREACH dia IN ARRAY dias LOOP
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 3    FROM recetas r JOIN alimentos a ON a.nombre='Galleta salma'           WHERE r.nombre='Chilaquiles Salmas con Frijoles y Requesón' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 0.5  FROM recetas r JOIN alimentos a ON a.nombre='Aceite en spray'         WHERE r.nombre='Chilaquiles Salmas con Frijoles y Requesón' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 0.5  FROM recetas r JOIN alimentos a ON a.nombre='Crema'                   WHERE r.nombre='Chilaquiles Salmas con Frijoles y Requesón' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Frijol cocido'           WHERE r.nombre='Chilaquiles Salmas con Frijoles y Requesón' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1.5  FROM recetas r JOIN alimentos a ON a.nombre='Huevo entero'            WHERE r.nombre='Chilaquiles Salmas con Frijoles y Requesón' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1.5  FROM recetas r JOIN alimentos a ON a.nombre='Requesón'                WHERE r.nombre='Chilaquiles Salmas con Frijoles y Requesón' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 2    FROM recetas r JOIN alimentos a ON a.nombre='Puré de tomate'          WHERE r.nombre='Chilaquiles Salmas con Frijoles y Requesón' AND r.dia_semana=dia;
  END LOOP;
END $$;

-- ── BURRITO DE FRIJOLES (Martes=2, Sábado=6) ───────────────
DO $$
DECLARE dias INT[] := ARRAY[2, 6];
        dia  INT;
BEGIN
  FOREACH dia IN ARRAY dias LOOP
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 3    FROM recetas r JOIN alimentos a ON a.nombre='Pan árabe integral'      WHERE r.nombre='Burrito de Frijoles' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 0.5  FROM recetas r JOIN alimentos a ON a.nombre='Aguacate'                WHERE r.nombre='Burrito de Frijoles' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 0.5  FROM recetas r JOIN alimentos a ON a.nombre='Aceite de oliva'         WHERE r.nombre='Burrito de Frijoles' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Frijol cocido'           WHERE r.nombre='Burrito de Frijoles' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 3    FROM recetas r JOIN alimentos a ON a.nombre='Pechuga de pollo'        WHERE r.nombre='Burrito de Frijoles' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 0.5  FROM recetas r JOIN alimentos a ON a.nombre='Cebolla morada/blanca'   WHERE r.nombre='Burrito de Frijoles' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 0.5  FROM recetas r JOIN alimentos a ON a.nombre='Jitomate'                WHERE r.nombre='Burrito de Frijoles' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 0.5  FROM recetas r JOIN alimentos a ON a.nombre='Calabacita'              WHERE r.nombre='Burrito de Frijoles' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 0.5  FROM recetas r JOIN alimentos a ON a.nombre='Espinaca'                WHERE r.nombre='Burrito de Frijoles' AND r.dia_semana=dia;
  END LOOP;
END $$;

-- ── HUEVOS REVUELTOS CON NOPALES (Miércoles=3, Domingo=7) ──
DO $$
DECLARE dias INT[] := ARRAY[3, 7];
        dia  INT;
BEGIN
  FOREACH dia IN ARRAY dias LOOP
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 3    FROM recetas r JOIN alimentos a ON a.nombre='Galleta salma'           WHERE r.nombre='Huevos Revueltos con Nopales' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Aceite de oliva'         WHERE r.nombre='Huevos Revueltos con Nopales' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Frijol cocido'           WHERE r.nombre='Huevos Revueltos con Nopales' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1.5  FROM recetas r JOIN alimentos a ON a.nombre='Huevo entero'            WHERE r.nombre='Huevos Revueltos con Nopales' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1.5  FROM recetas r JOIN alimentos a ON a.nombre='Clara de huevo'          WHERE r.nombre='Huevos Revueltos con Nopales' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 0.67 FROM recetas r JOIN alimentos a ON a.nombre='Nopal cocido'            WHERE r.nombre='Huevos Revueltos con Nopales' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 0.67 FROM recetas r JOIN alimentos a ON a.nombre='Jitomate'                WHERE r.nombre='Huevos Revueltos con Nopales' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 0.67 FROM recetas r JOIN alimentos a ON a.nombre='Cebolla morada/blanca'   WHERE r.nombre='Huevos Revueltos con Nopales' AND r.dia_semana=dia;
  END LOOP;
END $$;

-- ── LONCHE COMPLETO (Jueves=4) ──────────────────────────────
INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
SELECT r.id, a.id, 3    FROM recetas r JOIN alimentos a ON a.nombre='Bolillo/birote sin migajón'  WHERE r.nombre='Lonche Completo' AND r.dia_semana=4;
INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Aguacate'                    WHERE r.nombre='Lonche Completo' AND r.dia_semana=4;
INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Frijol cocido'               WHERE r.nombre='Lonche Completo' AND r.dia_semana=4;
INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
SELECT r.id, a.id, 1.5  FROM recetas r JOIN alimentos a ON a.nombre='Jamón bajo en grasa'         WHERE r.nombre='Lonche Completo' AND r.dia_semana=4;
INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
SELECT r.id, a.id, 1.5  FROM recetas r JOIN alimentos a ON a.nombre='Queso panela'                WHERE r.nombre='Lonche Completo' AND r.dia_semana=4;
INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
SELECT r.id, a.id, 0.67 FROM recetas r JOIN alimentos a ON a.nombre='Cebolla morada/blanca'       WHERE r.nombre='Lonche Completo' AND r.dia_semana=4;
INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
SELECT r.id, a.id, 0.67 FROM recetas r JOIN alimentos a ON a.nombre='Jitomate'                    WHERE r.nombre='Lonche Completo' AND r.dia_semana=4;
INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
SELECT r.id, a.id, 0.67 FROM recetas r JOIN alimentos a ON a.nombre='Lechuga'                     WHERE r.nombre='Lonche Completo' AND r.dia_semana=4;

-- ── FILETE DE POLLO CON VEGETALES (Lunes=1, Viernes=5) ─────
DO $$
DECLARE dias INT[] := ARRAY[1, 5];
        dia  INT;
BEGIN
  FOREACH dia IN ARRAY dias LOOP
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 3    FROM recetas r JOIN alimentos a ON a.nombre='Arroz cocido'            WHERE r.nombre='Filete de Pollo con Vegetales' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Piña'                    WHERE r.nombre='Filete de Pollo con Vegetales' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Aceite en spray'         WHERE r.nombre='Filete de Pollo con Vegetales' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 5    FROM recetas r JOIN alimentos a ON a.nombre='Pechuga de pollo'        WHERE r.nombre='Filete de Pollo con Vegetales' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Mix de vegetales verdes' WHERE r.nombre='Filete de Pollo con Vegetales' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Pepino'                  WHERE r.nombre='Filete de Pollo con Vegetales' AND r.dia_semana=dia;
  END LOOP;
END $$;

-- ── FAJITAS DE POLLO A LA MOSTAZA (Martes=2, Sábado=6) ─────
DO $$
DECLARE dias INT[] := ARRAY[2, 6];
        dia  INT;
BEGIN
  FOREACH dia IN ARRAY dias LOOP
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 3    FROM recetas r JOIN alimentos a ON a.nombre='Quinoa cruda'            WHERE r.nombre='Fajitas de Pollo a la Mostaza & Tajin' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Fresa'                   WHERE r.nombre='Fajitas de Pollo a la Mostaza & Tajin' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Vinagreta'               WHERE r.nombre='Fajitas de Pollo a la Mostaza & Tajin' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 5    FROM recetas r JOIN alimentos a ON a.nombre='Pechuga de pollo'        WHERE r.nombre='Fajitas de Pollo a la Mostaza & Tajin' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 2    FROM recetas r JOIN alimentos a ON a.nombre='Mix de vegetales verdes' WHERE r.nombre='Fajitas de Pollo a la Mostaza & Tajin' AND r.dia_semana=dia;
  END LOOP;
END $$;

-- ── PASTA CON BRÓCOLI Y POLLO (Miércoles=3, Domingo=7) ─────
DO $$
DECLARE dias INT[] := ARRAY[3, 7];
        dia  INT;
BEGIN
  FOREACH dia IN ARRAY dias LOOP
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 3    FROM recetas r JOIN alimentos a ON a.nombre='Pasta integral cocida'   WHERE r.nombre='Pasta con Brócoli y Pollo' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Naranja'                 WHERE r.nombre='Pasta con Brócoli y Pollo' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Crema'                   WHERE r.nombre='Pasta con Brócoli y Pollo' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 5    FROM recetas r JOIN alimentos a ON a.nombre='Pechuga de pollo'        WHERE r.nombre='Pasta con Brócoli y Pollo' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 2    FROM recetas r JOIN alimentos a ON a.nombre='Brócoli cocido'          WHERE r.nombre='Pasta con Brócoli y Pollo' AND r.dia_semana=dia;
  END LOOP;
END $$;

-- ── PESCADO MOJO DE AJO (Jueves=4) ─────────────────────────
INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
SELECT r.id, a.id, 3    FROM recetas r JOIN alimentos a ON a.nombre='Arroz integral cocido'       WHERE r.nombre='Pescado Mojo de Ajo con Vegetales' AND r.dia_semana=4;
INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Naranja'                     WHERE r.nombre='Pescado Mojo de Ajo con Vegetales' AND r.dia_semana=4;
INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Aceite de oliva'             WHERE r.nombre='Pescado Mojo de Ajo con Vegetales' AND r.dia_semana=4;
INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
SELECT r.id, a.id, 5    FROM recetas r JOIN alimentos a ON a.nombre='Pescado blanco'              WHERE r.nombre='Pescado Mojo de Ajo con Vegetales' AND r.dia_semana=4;
INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
SELECT r.id, a.id, 2    FROM recetas r JOIN alimentos a ON a.nombre='Mix de vegetales verdes'     WHERE r.nombre='Pescado Mojo de Ajo con Vegetales' AND r.dia_semana=4;

-- ── COLACIÓN 2: solo fruta ──────────────────────────────────
INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
SELECT r.id, a.id, 1 FROM recetas r JOIN alimentos a ON a.nombre='Mango'
WHERE r.nombre='Mango' AND r.dia_semana IN (1,4,7);

INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
SELECT r.id, a.id, 1 FROM recetas r JOIN alimentos a ON a.nombre='Naranja'
WHERE r.nombre='Naranja' AND r.dia_semana IN (2,5);

INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
SELECT r.id, a.id, 1 FROM recetas r JOIN alimentos a ON a.nombre='Manzana'
WHERE r.nombre='Manzana con Limón y Sal' AND r.dia_semana IN (3,6);

-- ── TOAST CON LICUADO VERDE (Lunes=1, Viernes=5) ───────────
DO $$
DECLARE dias INT[] := ARRAY[1, 5];
        dia  INT;
BEGIN
  FOREACH dia IN ARRAY dias LOOP
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 2    FROM recetas r JOIN alimentos a ON a.nombre='Pan integral'            WHERE r.nombre='Toast con Licuado Verde' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Papaya'                  WHERE r.nombre='Toast con Licuado Verde' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Aguacate'                WHERE r.nombre='Toast con Licuado Verde' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Sustituto lácteo de almendra' WHERE r.nombre='Toast con Licuado Verde' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 3    FROM recetas r JOIN alimentos a ON a.nombre='Requesón'                WHERE r.nombre='Toast con Licuado Verde' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Espinaca'                WHERE r.nombre='Toast con Licuado Verde' AND r.dia_semana=dia;
  END LOOP;
END $$;

-- ── MOLLETE SALADO (Martes=2, Sábado=6) ────────────────────
DO $$
DECLARE dias INT[] := ARRAY[2, 6];
        dia  INT;
BEGIN
  FOREACH dia IN ARRAY dias LOOP
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 2    FROM recetas r JOIN alimentos a ON a.nombre='Bolillo/birote sin migajón' WHERE r.nombre='Mollete Salado' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Plátano'                 WHERE r.nombre='Mollete Salado' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Nuez'                    WHERE r.nombre='Mollete Salado' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Leche deslactosada light' WHERE r.nombre='Mollete Salado' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 3    FROM recetas r JOIN alimentos a ON a.nombre='Queso panela'            WHERE r.nombre='Mollete Salado' AND r.dia_semana=dia;
  END LOOP;
END $$;

-- ── TACOS DE NOPALES Y FRUTA (Miércoles=3, Domingo=7) ──────
DO $$
DECLARE dias INT[] := ARRAY[3, 7];
        dia  INT;
BEGIN
  FOREACH dia IN ARRAY dias LOOP
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 2    FROM recetas r JOIN alimentos a ON a.nombre='Tortilla de maíz'        WHERE r.nombre='Tacos de Nopales y Fruta' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Papaya'                  WHERE r.nombre='Tacos de Nopales y Fruta' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Aguacate'                WHERE r.nombre='Tacos de Nopales y Fruta' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Yogurt deslactosado'     WHERE r.nombre='Tacos de Nopales y Fruta' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 3    FROM recetas r JOIN alimentos a ON a.nombre='Queso cottage'           WHERE r.nombre='Tacos de Nopales y Fruta' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 0.5  FROM recetas r JOIN alimentos a ON a.nombre='Jitomate'                WHERE r.nombre='Tacos de Nopales y Fruta' AND r.dia_semana=dia;
    INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
    SELECT r.id, a.id, 0.5  FROM recetas r JOIN alimentos a ON a.nombre='Nopal cocido'            WHERE r.nombre='Tacos de Nopales y Fruta' AND r.dia_semana=dia;
  END LOOP;
END $$;

-- ── SANDWICH DE HUEVO CON LICUADO (Jueves=4) ───────────────
INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
SELECT r.id, a.id, 2    FROM recetas r JOIN alimentos a ON a.nombre='Pan integral'                WHERE r.nombre='Sandwich de Huevo con Licuado' AND r.dia_semana=4;
INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Manzana'                     WHERE r.nombre='Sandwich de Huevo con Licuado' AND r.dia_semana=4;
INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
SELECT r.id, a.id, 0.5  FROM recetas r JOIN alimentos a ON a.nombre='Aguacate'                    WHERE r.nombre='Sandwich de Huevo con Licuado' AND r.dia_semana=4;
INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
SELECT r.id, a.id, 0.5  FROM recetas r JOIN alimentos a ON a.nombre='Aceite de oliva'             WHERE r.nombre='Sandwich de Huevo con Licuado' AND r.dia_semana=4;
INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
SELECT r.id, a.id, 1    FROM recetas r JOIN alimentos a ON a.nombre='Leche deslactosada light'    WHERE r.nombre='Sandwich de Huevo con Licuado' AND r.dia_semana=4;
INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
SELECT r.id, a.id, 1.5  FROM recetas r JOIN alimentos a ON a.nombre='Clara de huevo'              WHERE r.nombre='Sandwich de Huevo con Licuado' AND r.dia_semana=4;
INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
SELECT r.id, a.id, 1.5  FROM recetas r JOIN alimentos a ON a.nombre='Huevo entero'                WHERE r.nombre='Sandwich de Huevo con Licuado' AND r.dia_semana=4;
INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
SELECT r.id, a.id, 0.5  FROM recetas r JOIN alimentos a ON a.nombre='Mix de vegetales verdes'     WHERE r.nombre='Sandwich de Huevo con Licuado' AND r.dia_semana=4;
INSERT INTO receta_ingredientes (receta_id, alimento_id, porciones)
SELECT r.id, a.id, 0.5  FROM recetas r JOIN alimentos a ON a.nombre='Jitomate'                    WHERE r.nombre='Sandwich de Huevo con Licuado' AND r.dia_semana=4;

-- ============================================================
-- Verificación rápida
-- ============================================================
SELECT COUNT(*) AS total_recetas FROM recetas;
SELECT COUNT(*) AS total_ingredientes FROM receta_ingredientes;
