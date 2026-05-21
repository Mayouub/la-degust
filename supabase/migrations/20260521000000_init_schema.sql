-- ============================================================
-- Migration : schéma initial — La Dégust' du Grand Coin
-- Convention day_of_week : 0=Dimanche, 1=Lundi, …, 6=Samedi
-- ============================================================

-- ENUMs
CREATE TYPE user_role            AS ENUM ('admin', 'staff');
CREATE TYPE reservation_status   AS ENUM ('pending', 'confirmed', 'honored', 'no_show', 'cancelled');
CREATE TYPE reservation_source   AS ENUM ('online', 'phone', 'walk_in');
CREATE TYPE order_status         AS ENUM ('pending', 'confirmed', 'ready', 'collected', 'cancelled');

-- ============================================================
-- profiles (lié à auth.users)
-- ============================================================
CREATE TABLE profiles (
  id         uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       user_role   NOT NULL DEFAULT 'staff',
  full_name  text        NOT NULL,
  phone      text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- establishment_settings (singleton — id forcé à 1)
-- ============================================================
CREATE TABLE establishment_settings (
  id                       integer     PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name                     text        NOT NULL,
  address                  text,
  phone                    text,
  email                    text,
  description              text,
  latitude                 numeric(10, 7),
  longitude                numeric(10, 7),
  online_booking_enabled   boolean     NOT NULL DEFAULT true,
  online_ordering_enabled  boolean     NOT NULL DEFAULT true,
  updated_at               timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- opening_hours (horaires hebdomadaires par défaut)
-- ============================================================
CREATE TABLE opening_hours (
  id           serial    PRIMARY KEY,
  day_of_week  smallint  NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  is_closed    boolean   NOT NULL DEFAULT false,
  UNIQUE (day_of_week)
);

-- ============================================================
-- services (créneaux de service récurrents : midi/soir)
-- ============================================================
CREATE TABLE services (
  id                     uuid      PRIMARY KEY DEFAULT gen_random_uuid(),
  name                   text      NOT NULL,
  day_of_week            smallint  NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time             time      NOT NULL,
  end_time               time      NOT NULL CHECK (end_time > start_time),
  max_covers             integer   NOT NULL CHECK (max_covers > 0),
  slot_duration_minutes  integer   NOT NULL DEFAULT 15 CHECK (slot_duration_minutes > 0),
  table_duration_minutes integer   NOT NULL DEFAULT 90 CHECK (table_duration_minutes > 0),
  is_active              boolean   NOT NULL DEFAULT true
);

-- ============================================================
-- exceptional_closures
-- ============================================================
CREATE TABLE exceptional_closures (
  id          uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  date_start  date  NOT NULL,
  date_end    date  NOT NULL CHECK (date_end >= date_start),
  reason      text
);

-- ============================================================
-- reservations
-- ============================================================
CREATE TABLE reservations (
  id               uuid               PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       timestamptz        NOT NULL DEFAULT now(),
  customer_name    text               NOT NULL,
  customer_phone   text               NOT NULL,
  customer_email   text,
  party_size       integer            NOT NULL CHECK (party_size > 0),
  reservation_date date               NOT NULL,
  reservation_time time               NOT NULL,
  service_id       uuid               NOT NULL REFERENCES services(id),
  status           reservation_status NOT NULL DEFAULT 'pending',
  notes            text,
  source           reservation_source NOT NULL DEFAULT 'online',
  created_by       uuid               REFERENCES auth.users(id),
  public_token     uuid               NOT NULL DEFAULT gen_random_uuid() UNIQUE
);

-- ============================================================
-- product_categories
-- ============================================================
CREATE TABLE product_categories (
  id          uuid     PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text     NOT NULL,
  sort_order  integer  NOT NULL DEFAULT 0,
  is_active   boolean  NOT NULL DEFAULT true
);

-- ============================================================
-- products (catalogue C&C)
-- ============================================================
CREATE TABLE products (
  id             uuid     PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id    uuid     NOT NULL REFERENCES product_categories(id),
  name           text     NOT NULL,
  description    text,
  image_url      text,
  unit_label     text     NOT NULL,
  price_cents    integer  NOT NULL CHECK (price_cents >= 0),
  is_available   boolean  NOT NULL DEFAULT true,
  stock_quantity integer,  -- NULL = illimité
  sort_order     integer  NOT NULL DEFAULT 0
);

-- ============================================================
-- pickup_slots (créneaux de retrait C&C)
-- ============================================================
CREATE TABLE pickup_slots (
  id           uuid      PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week  smallint  NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time   time      NOT NULL,
  end_time     time      NOT NULL CHECK (end_time > start_time),
  max_orders   integer   NOT NULL CHECK (max_orders > 0),
  is_active    boolean   NOT NULL DEFAULT true
);

-- ============================================================
-- orders (commandes C&C)
-- ============================================================
CREATE TABLE orders (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz   NOT NULL DEFAULT now(),
  customer_name   text          NOT NULL,
  customer_phone  text          NOT NULL,
  customer_email  text,
  pickup_date     date          NOT NULL,
  pickup_time     time          NOT NULL,
  total_cents     integer       NOT NULL CHECK (total_cents >= 0),
  status          order_status  NOT NULL DEFAULT 'pending',
  paid_on_site    boolean       NOT NULL DEFAULT false,
  notes           text,
  public_token    uuid          NOT NULL DEFAULT gen_random_uuid() UNIQUE
);

-- ============================================================
-- order_items
-- ============================================================
CREATE TABLE order_items (
  id                    uuid     PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id              uuid     NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id            uuid     REFERENCES products(id) ON DELETE SET NULL,
  product_name_snapshot text     NOT NULL,
  unit_price_cents      integer  NOT NULL CHECK (unit_price_cents >= 0),
  quantity              integer  NOT NULL CHECK (quantity > 0)
);

-- ============================================================
-- Index
-- ============================================================
CREATE INDEX idx_reservations_date         ON reservations(reservation_date);
CREATE INDEX idx_reservations_status       ON reservations(status);
CREATE INDEX idx_reservations_service      ON reservations(service_id);
CREATE INDEX idx_reservations_public_token ON reservations(public_token);
CREATE INDEX idx_orders_pickup_date        ON orders(pickup_date);
CREATE INDEX idx_orders_status             ON orders(status);
CREATE INDEX idx_orders_public_token       ON orders(public_token);
CREATE INDEX idx_order_items_order         ON order_items(order_id);
CREATE INDEX idx_products_category         ON products(category_id);
CREATE INDEX idx_products_available        ON products(is_available);
CREATE INDEX idx_services_day_active       ON services(day_of_week, is_active);

-- ============================================================
-- Trigger updated_at (establishment_settings uniquement)
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_establishment_settings_updated_at
  BEFORE UPDATE ON establishment_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
