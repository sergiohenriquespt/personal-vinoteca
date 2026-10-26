ALTER TABLE videiras_consumptions ADD COLUMN location_id uuid REFERENCES videiras_locations(id) ON DELETE SET NULL;
