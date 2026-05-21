-- ============================================================
-- Migration : RLS policies
-- ============================================================

-- Fonction helper : l'utilisateur courant est-il admin ?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;

-- ============================================================
-- Activation RLS sur toutes les tables
-- ============================================================
ALTER TABLE profiles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishment_settings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE opening_hours           ENABLE ROW LEVEL SECURITY;
ALTER TABLE services                ENABLE ROW LEVEL SECURITY;
ALTER TABLE exceptional_closures    ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations            ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE products                ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_slots            ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items             ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- profiles
-- Un utilisateur lit/modifie son propre profil.
-- Un admin voit et modifie tous les profils.
-- ============================================================
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR is_admin());

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR is_admin())
  WITH CHECK (id = auth.uid() OR is_admin());

CREATE POLICY "profiles_delete_admin" ON profiles
  FOR DELETE TO authenticated
  USING (is_admin());

-- ============================================================
-- establishment_settings — lecture publique, écriture admin
-- ============================================================
CREATE POLICY "establishment_settings_select_public" ON establishment_settings
  FOR SELECT USING (true);

CREATE POLICY "establishment_settings_insert_admin" ON establishment_settings
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "establishment_settings_update_admin" ON establishment_settings
  FOR UPDATE TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "establishment_settings_delete_admin" ON establishment_settings
  FOR DELETE TO authenticated
  USING (is_admin());

-- ============================================================
-- opening_hours — lecture publique, écriture admin
-- ============================================================
CREATE POLICY "opening_hours_select_public" ON opening_hours
  FOR SELECT USING (true);

CREATE POLICY "opening_hours_insert_admin" ON opening_hours
  FOR INSERT TO authenticated WITH CHECK (is_admin());

CREATE POLICY "opening_hours_update_admin" ON opening_hours
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "opening_hours_delete_admin" ON opening_hours
  FOR DELETE TO authenticated USING (is_admin());

-- ============================================================
-- services — lecture publique, écriture admin
-- ============================================================
CREATE POLICY "services_select_public" ON services
  FOR SELECT USING (true);

CREATE POLICY "services_insert_admin" ON services
  FOR INSERT TO authenticated WITH CHECK (is_admin());

CREATE POLICY "services_update_admin" ON services
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "services_delete_admin" ON services
  FOR DELETE TO authenticated USING (is_admin());

-- ============================================================
-- exceptional_closures — lecture publique, écriture admin
-- ============================================================
CREATE POLICY "exceptional_closures_select_public" ON exceptional_closures
  FOR SELECT USING (true);

CREATE POLICY "exceptional_closures_insert_admin" ON exceptional_closures
  FOR INSERT TO authenticated WITH CHECK (is_admin());

CREATE POLICY "exceptional_closures_update_admin" ON exceptional_closures
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "exceptional_closures_delete_admin" ON exceptional_closures
  FOR DELETE TO authenticated USING (is_admin());

-- ============================================================
-- product_categories — lecture publique, écriture admin
-- ============================================================
CREATE POLICY "product_categories_select_public" ON product_categories
  FOR SELECT USING (true);

CREATE POLICY "product_categories_insert_admin" ON product_categories
  FOR INSERT TO authenticated WITH CHECK (is_admin());

CREATE POLICY "product_categories_update_admin" ON product_categories
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "product_categories_delete_admin" ON product_categories
  FOR DELETE TO authenticated USING (is_admin());

-- ============================================================
-- products — lecture publique, écriture admin
-- ============================================================
CREATE POLICY "products_select_public" ON products
  FOR SELECT USING (true);

CREATE POLICY "products_insert_admin" ON products
  FOR INSERT TO authenticated WITH CHECK (is_admin());

CREATE POLICY "products_update_admin" ON products
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "products_delete_admin" ON products
  FOR DELETE TO authenticated USING (is_admin());

-- ============================================================
-- pickup_slots — lecture publique, écriture admin
-- ============================================================
CREATE POLICY "pickup_slots_select_public" ON pickup_slots
  FOR SELECT USING (true);

CREATE POLICY "pickup_slots_insert_admin" ON pickup_slots
  FOR INSERT TO authenticated WITH CHECK (is_admin());

CREATE POLICY "pickup_slots_update_admin" ON pickup_slots
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "pickup_slots_delete_admin" ON pickup_slots
  FOR DELETE TO authenticated USING (is_admin());

-- ============================================================
-- reservations
-- • INSERT : tout le monde (online + walk_in admin)
-- • SELECT : admin OU token public connu (set app.public_token)
-- • UPDATE/DELETE : admin uniquement
-- ============================================================
CREATE POLICY "reservations_insert_public" ON reservations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "reservations_select_admin_or_token" ON reservations
  FOR SELECT
  USING (
    is_admin()
    OR public_token = nullif(current_setting('app.public_token', true), '')::uuid
  );

CREATE POLICY "reservations_update_admin" ON reservations
  FOR UPDATE TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "reservations_delete_admin" ON reservations
  FOR DELETE TO authenticated
  USING (is_admin());

-- ============================================================
-- orders
-- • INSERT : tout le monde
-- • SELECT : admin OU token public
-- • UPDATE/DELETE : admin uniquement
-- ============================================================
CREATE POLICY "orders_insert_public" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "orders_select_admin_or_token" ON orders
  FOR SELECT
  USING (
    is_admin()
    OR public_token = nullif(current_setting('app.public_token', true), '')::uuid
  );

CREATE POLICY "orders_update_admin" ON orders
  FOR UPDATE TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "orders_delete_admin" ON orders
  FOR DELETE TO authenticated
  USING (is_admin());

-- ============================================================
-- order_items
-- • INSERT : tout le monde (même transaction que la commande)
-- • SELECT : admin OU si la commande parente est lisible via token
-- • UPDATE/DELETE : admin uniquement
-- ============================================================
CREATE POLICY "order_items_insert_public" ON order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "order_items_select_admin_or_token" ON order_items
  FOR SELECT
  USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.public_token = nullif(current_setting('app.public_token', true), '')::uuid
    )
  );

CREATE POLICY "order_items_update_admin" ON order_items
  FOR UPDATE TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "order_items_delete_admin" ON order_items
  FOR DELETE TO authenticated
  USING (is_admin());
