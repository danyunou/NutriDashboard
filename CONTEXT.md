# NutriDashboard — Contexto del Proyecto

## ¿Qué es?

Web app personal (PWA) para digitalizar y seguir el plan alimenticio semanal asignado por la nutrióloga Alejandra Ramírez. Muestra las comidas del día organizadas por franja horaria, permite intercambiar alimentos por equivalentes del mismo grupo nutricional calculando los gramos automáticamente, y genera listas de compras dinámicas por día.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite |
| Estilos | Tailwind CSS v3 |
| Base de datos | Supabase (PostgreSQL) |
| Hosting | Vercel (auto-deploy desde GitHub) |
| PWA | vite-plugin-pwa + Workbox |

---

## Repositorio y Deploy

- **GitHub:** https://github.com/danyunou/NutriDashboard
- **Vercel:** conectado al repo, re-deploya automáticamente con cada push a `main`

### Variables de entorno

Requeridas en `.env` local y en Vercel → Settings → Environment Variables:

```
VITE_SUPABASE_URL=https://vvllzbrvzlmzloyofzjv.supabase.co
VITE_SUPABASE_ANON_KEY=tu_publishable_key
```

> El archivo `.env` está en `.gitignore` — nunca se sube al repo.

---

## Base de Datos (Supabase)

### Tablas

| Tabla | Descripción |
|---|---|
| `grupos_alimentos` | 7 grupos: Verduras, Frutas, Cereales, Leguminosas, Proteínas, Leche, Grasas |
| `alimentos` | Catálogo de ~80 equivalentes con porción en texto y gramos por equivalente |
| `momentos_dia` | 5 franjas horarias: 7:00, 11:00, 16:00, 17:00, 20:00 |
| `distribucion_diaria` | Porciones requeridas por grupo en cada momento del día |
| `recetas` | 35 recetas (7 días × 5 momentos) |
| `receta_ingredientes` | Ingredientes de cada receta con número de porciones calculadas |

### Vistas

| Vista | Descripción |
|---|---|
| `v_receta_ingredientes` | Ingredientes con gramos calculados, grupo y `grupo_id` |
| `v_porciones_por_receta` | Resumen nutricional por receta |

### RLS

Habilitado en todas las tablas. Políticas de lectura pública (`FOR SELECT USING (true)`) — app de uso personal, sin autenticación aún.

---

## Archivos SQL

Todos están en `src/data/`. Orden de ejecución en Supabase SQL Editor:

| Archivo | Qué hace | Estado |
|---|---|---|
| `schema.sql` | Crea tablas, índices y vistas | ✅ Corrido |
| `src/data/seed.sql` | Grupos, momentos, distribución y alimentos base | ✅ Corrido |
| `src/data/fix_vista.sql` | Recrea vistas con `DROP` + `CREATE` para exponer `grupo_id` | ⚠️ Pendiente |
| `src/data/seed_recetas.sql` | Plan semanal completo: corrige gramos, agrega alimentos faltantes, inserta 35 recetas con ingredientes | ⚠️ Pendiente |

> **Importante:** correr `fix_vista.sql` antes de `seed_recetas.sql`.

---

## Estructura del Frontend

```
src/
├── lib/
│   ├── supabaseClient.js       ← cliente Supabase (lee .env)
│   └── utils.js                ← cn(), DIAS, calcularGramos(), getDiaActual()
├── hooks/
│   └── useNutriData.js         ← useMomentosConRecetas
│                                  useAlimentosPorGrupo
│                                  useIngredientesReceta
├── components/
│   ├── ui/
│   │   ├── Badge.jsx           ← chip de grupo con color por categoría
│   │   └── Spinner.jsx         ← loading indicator
│   ├── dashboard/
│   │   ├── DashboardDiario.jsx ← vista principal + selector de días
│   │   ├── MomentoCard.jsx     ← acordeón por franja horaria
│   │   └── AlimentoSelector.jsx← intercambiador de equivalentes
│   └── shopping/
│       └── ListaCompras.jsx    ← checklist agrupado por categoría
└── App.jsx                     ← bottom nav (Mi Plan / Compras)
```

---

## Features Implementadas

### Dashboard Diario
- Selector de días L/M/X/J/V/S/D con punto indicador del día actual
- 5 acordeones por franja horaria con emoji contextual (🌅 ☀️ 🍽️ 🍎 🌙)
- Badges de porciones requeridas por grupo nutricional en cada momento

### Intercambiador de Alimentos
- Al tocar un ingrediente se despliega lista de equivalentes del mismo grupo
- Fórmula: `gramos = porcion_gramos × porciones`
- Check visual en el alimento activo, ícono de swap en cada fila

### Lista de Compras
- Selección multi-día con toggle por botón
- Agrupa ingredientes por categoría con emoji por grupo
- Suma gramos de todos los días seleccionados
- Checklist con contador `X/total` persistente en sesión

### PWA
- Service worker con Workbox: cache de assets estáticos + `NetworkFirst` para llamadas a Supabase
- Web App Manifest con íconos 192px y 512px
- Instalable como app nativa desde Chrome/Safari/Edge

---

## Diseño

- **Paleta:** zinc (más suave que gris puro, menos agresivo en pantalla oscura)
- **Mobile-first:** `max-w-lg` centrado, sin scroll horizontal
- **Safe areas iOS:** `env(safe-area-inset-bottom/top)` para notch y home bar
- **Tipografía:** system font stack (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`)
- **Interacción:** `touch-action: manipulation`, `-webkit-tap-highlight-color: transparent`
- **Bottom nav:** fijo con safe area, íconos con `strokeWidth` dinámico según estado activo

---

## Plan Alimenticio Cargado

Del plan asignado por **Alejandra Ramírez** (30/05/2024):

### Distribución diaria de porciones

| Momento | Hora | Verduras | Frutas | Cereales | Leguminosas | Proteínas | Leche | Grasas |
|---|---|---|---|---|---|---|---|---|
| Colación 1 | 7:00 | 1 | 1 | 1 | 0 | 0 | 0 | 1.5 |
| Desayuno | 11:00 | 2 | 0 | 3 | 1 | 3 | 0 | 1 |
| Comida | 16:00 | 2 | 1 | 3 | 0 | 5 | 0 | 1 |
| Colación 2 | 17:00 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |
| Cena | 20:00 | 1 | 1 | 2 | 0 | 3 | 1 | 1 |

### Recetas por día

| Momento | Lunes | Martes | Miércoles | Jueves | Viernes | Sábado | Domingo |
|---|---|---|---|---|---|---|---|
| Colación 1 | Jugo Verde | Batido Papaya y Fresa | Jugo de Manzana | Avena Alta en Fibra | Jugo Verde | Batido Papaya y Fresa | Jugo de Manzana |
| Desayuno | Chilaquiles Salmas | Burrito de Frijoles | Huevos con Nopales | Lonche Completo | Chilaquiles Salmas | Burrito de Frijoles | Huevos con Nopales |
| Comida | Filete de Pollo | Fajitas Mostaza & Tajin | Pasta Brócoli Pollo | Pescado Mojo de Ajo | Filete de Pollo | Fajitas Mostaza & Tajin | Pasta Brócoli Pollo |
| Colación 2 | Mango | Naranja | Manzana c/limón | Mango | Naranja | Manzana c/limón | Mango |
| Cena | Toast Licuado Verde | Mollete Salado | Tacos de Nopales | Sandwich de Huevo | Toast Licuado Verde | Mollete Salado | Tacos de Nopales |

---

## Comandos Útiles

```bash
# Desarrollo local
npm run dev

# Build de producción
npm run build

# Preview del build (activa PWA)
npx vite preview
```

---

## Pendiente

| Tarea | Prioridad |
|---|---|
| Correr `fix_vista.sql` y `seed_recetas.sql` en Supabase | 🔴 Alta — sin esto el intercambiador no funciona |
| Verificar que las 35 recetas cargaron correctamente | 🔴 Alta |
| Completar catálogo de alimentos (~200 equivalentes del PDF, hoy hay ~80) | 🟡 Media |
| Autenticación con Supabase Auth + RLS por `user_id` | 🟢 Baja (multi-usuario futuro) |
