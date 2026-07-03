-- Órdenes de la tienda. Una fila por intento de pago (creado desde el checkout).
CREATE TABLE IF NOT EXISTS orders (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  product_id    text        NOT NULL,
  product_name  text        NOT NULL,
  product_slug  text,
  amount        integer     NOT NULL,          -- monto en ARS (entero)
  status        text        NOT NULL,          -- approved | in_process | rejected | pending | ...
  status_detail text,
  payment_id    text        UNIQUE,            -- id del pago en MercadoPago
  payer_email   text,
  payer_dni     text
);

CREATE INDEX IF NOT EXISTS orders_payment_id_idx ON orders (payment_id);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC);

-- Datos de envío (agregados en una fase posterior; idempotente sobre tablas existentes).
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ship_name     text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ship_phone    text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ship_address  text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ship_city     text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ship_province text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ship_zip      text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ship_notes    text;

-- Método de pago y costo de envío (fase de métodos de pago).
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method text;   -- mercadopago | transferencia | efectivo
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_zone  text;   -- CABA | GBA
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost  integer;
