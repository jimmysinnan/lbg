-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Lieux (retrait, livraison, événement)
CREATE TABLE locations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('retrait', 'livraison', 'evenement')),
  address     TEXT,
  hours       TEXT,
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Événements
CREATE TABLE events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  location_id UUID REFERENCES locations(id),
  date        DATE,
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Produits du catalogue
CREATE TABLE products (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  flavor           TEXT,
  category         TEXT NOT NULL CHECK (category IN ('yolice', 'aperitif_glace', 'coffret_personnalise')),
  format           TEXT NOT NULL CHECK (format IN ('unite', 'coffret_8', 'coffret_20')),
  price_unit       DECIMAL(10,2),
  price_box8       DECIMAL(10,2),
  price_box20      DECIMAL(10,2),
  available        BOOLEAN DEFAULT true,
  stock_estimated  INTEGER,
  month_active     TEXT,
  image_url        TEXT,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- Disponibilité produit par lieu
CREATE TABLE product_locations (
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  available   BOOLEAN DEFAULT true,
  PRIMARY KEY (product_id, location_id)
);

-- Coffrets composés
CREATE TABLE coffrets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  size         INTEGER NOT NULL CHECK (size IN (8, 20)),
  price        DECIMAL(10,2),
  available    BOOLEAN DEFAULT true,
  month_active TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE coffret_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coffret_id  UUID REFERENCES coffrets(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity    INTEGER NOT NULL
);

-- Commandes
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference       TEXT UNIQUE NOT NULL,
  customer_name   TEXT,
  customer_phone  TEXT,
  raw_message     TEXT,
  parsed_data     JSONB,
  status          TEXT DEFAULT 'a_traiter' CHECK (status IN (
                    'a_traiter','validee','en_preparation','prete','livree','annulee','escalade'
                  )),
  notes           TEXT,
  location_id     UUID REFERENCES locations(id),
  event_id        UUID REFERENCES events(id),
  pickup_date     DATE,
  pickup_time     TIME,
  total_amount    DECIMAL(10,2),
  wa_message_id   TEXT,
  escalate        BOOLEAN DEFAULT false,
  escalate_reason TEXT,
  confidence      TEXT CHECK (confidence IN ('high', 'medium', 'low')),
  missing_fields  TEXT[] DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Lignes de commande
CREATE TABLE order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES products(id),
  quantity    INTEGER NOT NULL,
  unit_price  DECIMAL(10,2),
  notes       TEXT
);

-- Messages WhatsApp (log)
CREATE TABLE wa_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wa_message_id TEXT UNIQUE,
  direction     TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  phone         TEXT NOT NULL,
  body          TEXT,
  timestamp     TIMESTAMPTZ,
  order_id      UUID REFERENCES orders(id),
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Templates messages WhatsApp
CREATE TABLE wa_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,
  body_template   TEXT NOT NULL,
  trigger_status  TEXT
);

-- Trigger updated_at sur orders
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Données initiales : templates WhatsApp
INSERT INTO wa_templates (slug, body_template, trigger_status) VALUES
  ('commande_validee',
   E'Bonjour {{prenom}} \U0001F366\n\nVotre commande {{reference}} est confirmée.\n{{details}}\nMontant estimé : {{montant}}€\nRetrait : {{lieu}} à {{horaire}}\n\nMerci pour votre confiance.',
   'validee'),
  ('commande_prete',
   E'Bonjour {{prenom}} \U0001F366\n\nBonne nouvelle : votre commande {{reference}} est prête.\n\nVous pouvez la récupérer à :\n{{lieu}}\n\nÀ tout de suite.',
   'prete'),
  ('commande_livree',
   E'Merci {{prenom}} \U0001F366\n\nVotre commande {{reference}} a bien été récupérée.\n\nToute l''équipe La Bonne Glace Martinique vous remercie.\nÀ très bientôt pour découvrir les nouveaux parfums du mois.',
   'livree'),
  ('commande_annulee',
   E'Bonjour {{prenom}} \U0001F366\n\nVotre commande {{reference}} a été annulée.\nN''hésitez pas à nous recontacter.\n\nLa Bonne Glace Martinique.',
   'annulee');

-- Lieu par défaut
INSERT INTO locations (name, type, address, hours, active) VALUES
  ('Galeries Bois Quarré – Lamentin', 'retrait', 'Galeries de Bois Quarré, 97232 Le Lamentin', 'Mar-Sam 9h-19h', true);
