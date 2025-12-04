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
 


-- funções para verificar se as tabelas foram criadas corretamente
DROP TABLE IF EXISTS todos;

select *  from users
DROP TABLE IF EXISTS users CASCADE;

select * from todos;