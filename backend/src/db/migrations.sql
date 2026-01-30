-- ============================================
-- MIGRATIONS - BANCO DE DADOS LEIDY CLEANER
-- ============================================

-- TABELA: users (com dados empresariais)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  cpf_cnpj TEXT,
  role TEXT DEFAULT 'client' CHECK(role IN ('client', 'admin', 'staff')),
  
  -- Dados Empresariais (para staff)
  company_name TEXT,
  company_cnpj TEXT,
  company_address TEXT,
  company_phone TEXT,
  bank_account TEXT,
  bank_routing TEXT,
  
  -- Dados Pessoais Completos
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  
  -- Sistema de Fidelidade
  five_star_streak INTEGER DEFAULT 0,
  total_five_stars INTEGER DEFAULT 0,
  loyalty_bonus DECIMAL(10,2) DEFAULT 0.00,
  bonus_redeemed BOOLEAN DEFAULT 0,
  
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- TABELA: services (com novo sistema de preços)
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Preço por hora (primeira hora)
  base_price DECIMAL(10,2) DEFAULT 40.00,
  additional_hour_price DECIMAL(10,2) DEFAULT 20.00,
  
  -- Ajustes de preço
  staff_fee_percentage DECIMAL(5,2) DEFAULT 40.00,
  post_work_multiplier DECIMAL(3,2) DEFAULT 1.50,
  
  duration INTEGER DEFAULT 60,
  category TEXT,
  active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- TABELA: bookings (com avaliação e detalhes de preço)
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration_hours INTEGER DEFAULT 2,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  
  -- Cálculo de Preço Detalhado
  base_price DECIMAL(10,2),
  staff_fee DECIMAL(10,2) DEFAULT 0.00,
  extra_quarter_hours DECIMAL(5,2) DEFAULT 0.00,
  post_work_adjustment DECIMAL(10,2) DEFAULT 0.00,
  final_price DECIMAL(10,2),
  
  -- Status e Avaliação
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  rating INTEGER,
  review TEXT,
  
  -- Flags especiais
  is_post_work BOOLEAN DEFAULT 0,
  has_extra_quarter BOOLEAN DEFAULT 0,
  recurring BOOLEAN DEFAULT 0,
  
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (service_id) REFERENCES services(id)
);

-- TABELA: payments
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  method TEXT DEFAULT 'stripe' CHECK(method IN ('stripe', 'pix', 'cash')),
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed')),
  stripe_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- TABELA: loyalty_history (rastreamento de bônus)
CREATE TABLE IF NOT EXISTS loyalty_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  booking_id INTEGER,
  bonus_type TEXT CHECK(bonus_type IN ('five_star', 'bonus_reached', 'bonus_redeemed')),
  amount DECIMAL(10,2),
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- TABELA: recurring_bookings (agendamentos recorrentes)
CREATE TABLE IF NOT EXISTS recurring_bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  frequency TEXT CHECK(frequency IN ('weekly', 'biweekly', 'monthly')),
  day_of_week INTEGER,
  time TIME,
  address TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (service_id) REFERENCES services(id)
);

-- ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_rating ON bookings(rating);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_loyalty_user ON loyalty_history(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_user ON recurring_bookings(user_id);

-- SEED: Serviços padrão (com novo sistema de preços)
INSERT OR IGNORE INTO services (name, description, base_price, additional_hour_price, staff_fee_percentage, post_work_multiplier, duration, category) VALUES
('Limpeza Básica', 'Limpeza geral da residência', 40.00, 20.00, 40.00, 1.50, 120, 'residencial'),
('Limpeza Profunda', 'Limpeza completa com detalhes', 40.00, 20.00, 40.00, 1.50, 180, 'residencial'),
('Limpeza Pós-Reforma', 'Limpeza especializada pós-obra', 40.00, 20.00, 40.00, 2.00, 240, 'comercial'),
('Limpeza de Escritório', 'Limpeza de ambiente comercial', 40.00, 20.00, 40.00, 1.50, 90, 'comercial'),
('Limpeza de Vidros', 'Serviço especializado em janelas', 40.00, 20.00, 40.00, 1.50, 60, 'especializado'),
('Higienização de Estofados', 'Limpeza de móveis estofados', 40.00, 20.00, 40.00, 1.50, 120, 'especializado');

-- SEED: Usuário admin padrão (senha: admin123 - será hashada na prática)
INSERT OR IGNORE INTO users (email, password, name, phone, role) VALUES
('admin@leidycleaner.com', '$2b$10$placeholder', 'Administrador', '5198030000', 'admin');
