-- ============================================================
-- RPC atomique : vérification de disponibilité + création
-- de réservation en une seule transaction.
-- Utilise pg_advisory_xact_lock pour éviter les race conditions.
-- ============================================================

CREATE OR REPLACE FUNCTION check_and_create_reservation(
  p_service_id      uuid,
  p_date            date,
  p_time            time,
  p_party_size      integer,
  p_customer_name   text,
  p_customer_phone  text,
  p_customer_email  text    DEFAULT NULL,
  p_notes           text    DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_service   services%ROWTYPE;
  v_booked    integer;
  v_new_id    uuid := gen_random_uuid();
  v_token     uuid := gen_random_uuid();
BEGIN
  -- Récupère la config du service (doit être actif)
  SELECT * INTO v_service
  FROM services
  WHERE id = p_service_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'service_not_found');
  END IF;

  -- Verrou transactionnel sur (service, date) pour sérialiser les insertions
  -- concurrentes sur le même créneau
  PERFORM pg_advisory_xact_lock(
    hashtext(p_service_id::text || p_date::text)::bigint
  );

  -- Compte les couverts déjà occupés pour les réservations qui chevauchent
  -- la fenêtre [p_time, p_time + table_duration)
  SELECT COALESCE(SUM(r.party_size), 0) INTO v_booked
  FROM reservations r
  WHERE r.service_id       = p_service_id
    AND r.reservation_date = p_date
    AND r.status IN ('pending', 'confirmed', 'honored')
    AND r.reservation_time < p_time + (v_service.table_duration_minutes * interval '1 minute')
    AND r.reservation_time + (v_service.table_duration_minutes * interval '1 minute') > p_time;

  -- Vérifie la capacité
  IF v_booked + p_party_size > v_service.max_covers THEN
    RETURN jsonb_build_object('success', false, 'error', 'slot_full');
  END IF;

  -- Insertion atomique
  INSERT INTO reservations (
    id,
    customer_name, customer_phone, customer_email,
    party_size,
    reservation_date, reservation_time,
    service_id,
    notes,
    source,
    public_token
  ) VALUES (
    v_new_id,
    p_customer_name, p_customer_phone, p_customer_email,
    p_party_size,
    p_date, p_time,
    p_service_id,
    p_notes,
    'online',
    v_token
  );

  RETURN jsonb_build_object(
    'success', true,
    'data', jsonb_build_object(
      'id',               v_new_id,
      'public_token',     v_token,
      'customer_name',    p_customer_name,
      'customer_phone',   p_customer_phone,
      'customer_email',   p_customer_email,
      'party_size',       p_party_size,
      'reservation_date', p_date,
      'reservation_time', p_time,
      'service_id',       p_service_id,
      'status',           'pending'
    )
  );
END;
$$;
