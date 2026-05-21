-- ============================================================
-- Migration : seed de démonstration
-- Convention day_of_week : 0=Dim, 1=Lun, 2=Mar, 3=Mer, 4=Jeu, 5=Ven, 6=Sam
-- ============================================================

-- ============================================================
-- establishment_settings
-- ============================================================
INSERT INTO establishment_settings (
  id, name, address, phone, email, description,
  latitude, longitude,
  online_booking_enabled, online_ordering_enabled
) VALUES (
  1,
  'La Dégust'' du Grand Coin',
  '42 Route du Marais, 85580 Saint-Michel-en-l''Herm, Vendée',
  '02 51 30 00 00',
  'contact@ladegust-grandcoin.fr',
  'Dégustation d''huîtres en direct du producteur, au cœur du marais poitevin vendéen. Venez savourer nos huîtres fines et spéciales de claire dans un cadre authentique.',
  46.3542800,
  -1.2318600,
  true,
  true
);

-- ============================================================
-- opening_hours (fermé lundi)
-- ============================================================
INSERT INTO opening_hours (day_of_week, is_closed) VALUES
  (0, false),  -- Dimanche : ouvert
  (1, true),   -- Lundi    : fermé
  (2, false),  -- Mardi    : ouvert
  (3, false),  -- Mercredi : ouvert
  (4, false),  -- Jeudi    : ouvert
  (5, false),  -- Vendredi : ouvert
  (6, false);  -- Samedi   : ouvert

-- ============================================================
-- services (créneaux récurrents)
-- Service midi : mardi → dimanche, 12h00–14h30
-- Service soir : vendredi → dimanche, 19h00–22h00
-- ============================================================
INSERT INTO services (name, day_of_week, start_time, end_time, max_covers, slot_duration_minutes, table_duration_minutes, is_active) VALUES
  -- Service midi
  ('Service midi', 2, '12:00', '14:30', 24, 15, 90, true),  -- Mardi
  ('Service midi', 3, '12:00', '14:30', 24, 15, 90, true),  -- Mercredi
  ('Service midi', 4, '12:00', '14:30', 24, 15, 90, true),  -- Jeudi
  ('Service midi', 5, '12:00', '14:30', 24, 15, 90, true),  -- Vendredi
  ('Service midi', 6, '12:00', '14:30', 24, 15, 90, true),  -- Samedi
  ('Service midi', 0, '12:00', '14:30', 24, 15, 90, true),  -- Dimanche
  -- Service soir
  ('Service soir', 5, '19:00', '22:00', 24, 15, 90, true),  -- Vendredi
  ('Service soir', 6, '19:00', '22:00', 24, 15, 90, true),  -- Samedi
  ('Service soir', 0, '19:00', '22:00', 24, 15, 90, true);  -- Dimanche

-- ============================================================
-- product_categories
-- ============================================================
INSERT INTO product_categories (name, sort_order, is_active) VALUES
  ('Huîtres',          1, true),
  ('Plateaux',         2, true),
  ('Accompagnements',  3, true);

-- ============================================================
-- products
-- ============================================================
-- Utilise des sous-requêtes pour les category_id
INSERT INTO products (category_id, name, description, unit_label, price_cents, is_available, stock_quantity, sort_order)
SELECT id, 'Huîtres Fine de Claire n°3',
  'Huîtres élevées en claire pour un affinage délicat. Goût iodé, chair ferme.',
  'douzaine', 1200, true, null, 1
FROM product_categories WHERE name = 'Huîtres'
UNION ALL
SELECT id, 'Huîtres Fine de Claire n°2',
  'Calibre supérieur, chair plus charnue. Idéales pour les amateurs.',
  'douzaine', 1400, true, null, 2
FROM product_categories WHERE name = 'Huîtres'
UNION ALL
SELECT id, 'Huîtres Spéciale de Claire n°3',
  'Affinée 4 semaines minimum en claire. Notes noisettées et iodées.',
  'douzaine', 1500, true, null, 3
FROM product_categories WHERE name = 'Huîtres'
UNION ALL
SELECT id, 'Huîtres Fine de Claire n°3',
  'Format demi-douzaine, parfait pour une dégustation individuelle.',
  'demi-douzaine', 700, true, null, 4
FROM product_categories WHERE name = 'Huîtres'
UNION ALL
SELECT id, 'Plateau Découverte',
  '12 huîtres fines de claire assortties, pain de seigle et beurre salé.',
  'plateau', 1800, true, null, 1
FROM product_categories WHERE name = 'Plateaux'
UNION ALL
SELECT id, 'Plateau Prestige',
  '24 huîtres spéciales, pain artisanal, beurre demi-sel et citron.',
  'plateau', 3800, true, null, 2
FROM product_categories WHERE name = 'Plateaux'
UNION ALL
SELECT id, 'Pain de seigle au beurre',
  'Tranche de pain de seigle artisanal accompagnée de beurre demi-sel.',
  'portion', 300, true, null, 1
FROM product_categories WHERE name = 'Accompagnements'
UNION ALL
SELECT id, 'Vin blanc sec de Vendée (75 cl)',
  'Fiefs Vendéens — cépage Chenin, fruité et minéral, accord parfait avec les huîtres.',
  'bouteille', 1200, true, null, 2
FROM product_categories WHERE name = 'Accompagnements';

-- ============================================================
-- pickup_slots (C&C)
-- Mercredi–Jeudi : matinée seulement
-- Vendredi–Dimanche : matinée + après-midi
-- ============================================================
INSERT INTO pickup_slots (day_of_week, start_time, end_time, max_orders, is_active) VALUES
  -- Mercredi
  (3, '10:00', '11:00', 10, true),
  (3, '11:00', '12:00', 10, true),
  -- Jeudi
  (4, '10:00', '11:00', 10, true),
  (4, '11:00', '12:00', 10, true),
  -- Vendredi
  (5, '10:00', '11:00', 10, true),
  (5, '11:00', '12:00', 10, true),
  (5, '16:00', '17:00', 8,  true),
  (5, '17:00', '18:00', 8,  true),
  -- Samedi
  (6, '10:00', '11:00', 15, true),
  (6, '11:00', '12:00', 15, true),
  (6, '16:00', '17:00', 10, true),
  (6, '17:00', '18:00', 10, true),
  -- Dimanche
  (0, '10:00', '11:00', 12, true),
  (0, '11:00', '12:00', 12, true),
  (0, '16:00', '17:00', 8,  true);
