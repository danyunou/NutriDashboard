-- ============================================================
-- NutriDashboard — Seed Data
-- ============================================================

-- ------------------------------------------------------------
-- Grupos de alimentos
-- ------------------------------------------------------------
INSERT INTO grupos_alimentos (nombre, color_hex) VALUES
  ('Verduras',    '#22c55e'),
  ('Frutas',      '#f97316'),
  ('Cereales',    '#eab308'),
  ('Leguminosas', '#8b5cf6'),
  ('Proteínas',   '#ef4444'),
  ('Leche',       '#3b82f6'),
  ('Grasas',      '#a16207');

-- ------------------------------------------------------------
-- Momentos del día
-- ------------------------------------------------------------
INSERT INTO momentos_dia (nombre, hora) VALUES
  ('Colación 1', '07:00'),
  ('Desayuno',   '11:00'),
  ('Comida',     '16:00'),
  ('Colación 2', '17:00'),
  ('Cena',       '20:00');

-- ------------------------------------------------------------
-- Distribución diaria de porciones
-- ------------------------------------------------------------
INSERT INTO distribucion_diaria (momento_id, verduras, frutas, cereales, leguminosas, proteinas, leche, grasas)
SELECT id, 1, 1, 1, 0, 0, 0, 1.5 FROM momentos_dia WHERE nombre = 'Colación 1';

INSERT INTO distribucion_diaria (momento_id, verduras, frutas, cereales, leguminosas, proteinas, leche, grasas)
SELECT id, 2, 0, 3, 1, 3, 0, 1   FROM momentos_dia WHERE nombre = 'Desayuno';

INSERT INTO distribucion_diaria (momento_id, verduras, frutas, cereales, leguminosas, proteinas, leche, grasas)
SELECT id, 2, 1, 3, 0, 5, 0, 1   FROM momentos_dia WHERE nombre = 'Comida';

INSERT INTO distribucion_diaria (momento_id, verduras, frutas, cereales, leguminosas, proteinas, leche, grasas)
SELECT id, 0, 1, 0, 0, 0, 0, 0   FROM momentos_dia WHERE nombre = 'Colación 2';

INSERT INTO distribucion_diaria (momento_id, verduras, frutas, cereales, leguminosas, proteinas, leche, grasas)
SELECT id, 1, 1, 2, 0, 3, 1, 1   FROM momentos_dia WHERE nombre = 'Cena';

-- ------------------------------------------------------------
-- Alimentos — Verduras (porcion_gramos = gramos por 1 equivalente)
-- ------------------------------------------------------------
INSERT INTO alimentos (grupo_id, nombre, porcion_texto, porcion_gramos) VALUES
  ((SELECT id FROM grupos_alimentos WHERE nombre='Verduras'), 'Nopal',              '1 taza / 1 pza mediana',  70),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Verduras'), 'Jitomate',           '1 taza picado',           70),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Verduras'), 'Pepino',             '1 taza picado',           70),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Verduras'), 'Lechuga',            '1½ taza',                 70),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Verduras'), 'Espinaca',           '1½ taza cruda',           70),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Verduras'), 'Brócoli',            '½ taza cocido',           70),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Verduras'), 'Calabaza',           '½ taza cocida',           70),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Verduras'), 'Chayote',            '½ taza cocido',           70),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Verduras'), 'Chile poblano',      '1 pza mediana',           70),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Verduras'), 'Zanahoria',          '½ taza rallada',          70);

-- ------------------------------------------------------------
-- Alimentos — Frutas
-- ------------------------------------------------------------
INSERT INTO alimentos (grupo_id, nombre, porcion_texto, porcion_gramos) VALUES
  ((SELECT id FROM grupos_alimentos WHERE nombre='Frutas'), 'Manzana',      '1 pza pequeña',  90),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Frutas'), 'Naranja',      '1 pza mediana',  110),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Frutas'), 'Plátano',      '½ pza mediana',  60),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Frutas'), 'Papaya',       '1 taza picada',  120),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Frutas'), 'Melón',        '1 taza picado',  120),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Frutas'), 'Sandía',       '1 taza picada',  120),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Frutas'), 'Pera',         '1 pza pequeña',  90),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Frutas'), 'Durazno',      '1 pza mediana',  90),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Frutas'), 'Kiwi',         '1 pza mediana',  90),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Frutas'), 'Fresa',        '1 taza entera',  100);

-- ------------------------------------------------------------
-- Alimentos — Cereales
-- ------------------------------------------------------------
INSERT INTO alimentos (grupo_id, nombre, porcion_texto, porcion_gramos) VALUES
  ((SELECT id FROM grupos_alimentos WHERE nombre='Cereales'), 'Avena',              '¼ taza seca',    20),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Cereales'), 'Tortilla de maíz',   '1 pza',          30),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Cereales'), 'Arroz cocido',       '⅓ taza',         30),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Cereales'), 'Papa',               '1 pza pequeña',  90),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Cereales'), 'Pan integral',       '1 rebanada',     30),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Cereales'), 'Tostada horneada',   '2 pzas',         30),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Cereales'), 'Quinoa cocida',      '⅓ taza',         30),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Cereales'), 'Elote desgranado',   '⅓ taza',         40);

-- ------------------------------------------------------------
-- Alimentos — Leguminosas
-- ------------------------------------------------------------
INSERT INTO alimentos (grupo_id, nombre, porcion_texto, porcion_gramos) VALUES
  ((SELECT id FROM grupos_alimentos WHERE nombre='Leguminosas'), 'Frijoles negros cocidos', '½ taza',  80),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Leguminosas'), 'Lentejas cocidas',         '½ taza',  80),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Leguminosas'), 'Garbanzos cocidos',        '½ taza',  80),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Leguminosas'), 'Habas cocidas',            '½ taza',  80),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Leguminosas'), 'Soya texturizada seca',    '¼ taza',  30);

-- ------------------------------------------------------------
-- Alimentos — Proteínas
-- ------------------------------------------------------------
INSERT INTO alimentos (grupo_id, nombre, porcion_texto, porcion_gramos) VALUES
  ((SELECT id FROM grupos_alimentos WHERE nombre='Proteínas'), 'Pechuga de pollo',      '30g cocida',   30),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Proteínas'), 'Pescado blanco',        '30g cocido',   30),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Proteínas'), 'Atún en agua',          '¼ lata',       30),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Proteínas'), 'Huevo entero',          '1 pza',        53),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Proteínas'), 'Clara de huevo',        '3 claras',     90),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Proteínas'), 'Requesón',              '¼ taza',       60),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Proteínas'), 'Queso panela',          '30g',          30),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Proteínas'), 'Res magra (filete)',    '30g cocida',   30),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Proteínas'), 'Camarón cocido',        '30g',          30),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Proteínas'), 'Salmón',               '30g cocido',   30);

-- ------------------------------------------------------------
-- Alimentos — Leche
-- ------------------------------------------------------------
INSERT INTO alimentos (grupo_id, nombre, porcion_texto, porcion_gramos) VALUES
  ((SELECT id FROM grupos_alimentos WHERE nombre='Leche'), 'Leche descremada',   '240 ml (1 taza)', 240),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Leche'), 'Yogur natural bajo en grasa', '¾ taza', 180),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Leche'), 'Leche de soya',      '240 ml',          240);

-- ------------------------------------------------------------
-- Alimentos — Grasas
-- ------------------------------------------------------------
INSERT INTO alimentos (grupo_id, nombre, porcion_texto, porcion_gramos) VALUES
  ((SELECT id FROM grupos_alimentos WHERE nombre='Grasas'), 'Aceite de oliva',   '1 cdita (5ml)',   5),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Grasas'), 'Aguacate',          '⅛ pza / 2 cdas', 30),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Grasas'), 'Almendras',         '10 pzas',         15),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Grasas'), 'Nuez',              '2 mitades',       10),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Grasas'), 'Mantequilla de almendra', '1 cdita',  10),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Grasas'), 'Semillas de chía',  '1 cda',           12),
  ((SELECT id FROM grupos_alimentos WHERE nombre='Grasas'), 'Aceite de coco',    '1 cdita',          5);

-- ------------------------------------------------------------
-- Recetas de ejemplo (Lunes)
-- ------------------------------------------------------------
INSERT INTO recetas (nombre, momento_id, dia_semana, notas) VALUES
  ('Jugo Verde',              (SELECT id FROM momentos_dia WHERE nombre='Colación 1'), 1, 'Pepino + espinaca + manzana + avena + chía'),
  ('Chilaquiles Salmas',      (SELECT id FROM momentos_dia WHERE nombre='Desayuno'),   1, 'Con salsa verde, pollo y frijoles'),
  ('Fajitas de Pollo Mostaza',(SELECT id FROM momentos_dia WHERE nombre='Comida'),     1, 'Con tortillas, guacamole y ensalada'),
  ('Fruta de Temporada',      (SELECT id FROM momentos_dia WHERE nombre='Colación 2'), 1, NULL),
  ('Cena Ligera Lunes',       (SELECT id FROM momentos_dia WHERE nombre='Cena'),       1, 'Yogur + cereal + fruta');
