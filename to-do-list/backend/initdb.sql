-- init_db.sql

-- 1. TIPOS (DROP e CREATE)
-- É importante dropar o tipo antes de criá-lo novamente, especialmente em desenvolvimento.
DROP TYPE IF EXISTS user_role CASCADE;

CREATE TYPE user_role AS ENUM (
  'visualizacao',
  'gerencial',
  'administrativo'
);

-- 2. TABELA USERS
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role user_role DEFAULT 'visualizacao', -- Adiciona a coluna 'role' diretamente
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABELA TODOS
-- Cria a tabela todos, garante que a coluna 'status' já existe
CREATE TABLE IF NOT EXISTS todos (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  task TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'todo', -- Coluna de status
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. ÍNDICES (Opcional, mas bom para performance)
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos (user_id);

-- 5. DADOS INICIAIS (Opcional: cria um usuário admin padrão)
-- Insira aqui dados de teste, se necessário.
-- Exemplo:
-- INSERT INTO users (username, password, role) 
-- VALUES ('admin', 'hashed_password_aqui', 'administrativo') 
-- ON CONFLICT (username) DO NOTHING;

--NOVA VERSÃO

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'visualizacao', -- <<< ADICIONADO AQUI
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
 
CREATE TABLE todos (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,  -- Relacionamento com a tabela users
  task TEXT NOT NULL,
  status todo_status NOT NULL DEFAULT 'todo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
 


CREATE TYPE todo_status AS ENUM (
    'todo',
    'in_progress',
    'done'
);

CREATE TYPE user_role AS ENUM (
  'visualizacao',       -- Usuário de visualização
  'gerencial',      -- Usuário de gerenciamento
  'administrativo'         -- Administrador
);

DROP TABLE IF EXISTS todos;

select *  from users
DROP TABLE IF EXISTS users CASCADE;

select * from todos;