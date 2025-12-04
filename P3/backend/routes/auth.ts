// auth.ts - Arquivo principal de rotas

import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Database from '../db'; // Padrão Singleton em uso
import UserFactory from './userFactory'; // <-- Importa a Factory em TS

const router = express.Router();
// Padrão Singleton: Garante uma única instância de conexão com o DB
// Assumindo que Database.getInstance() retorna um pool de conexão tipado.
const pool = Database.getInstance(); 

// Interface para garantir a tipagem do corpo da requisição de registro
interface RegisterBody {
    username?: string;
    password?: string;
    role?: string;
}

// Interface para garantir a tipagem do corpo da requisição de login
interface LoginBody {
    username?: string;
    password?: string;
}

// Registro com role (default: 'visualizacao')
router.post('/register', async (req: Request<{}, {}, RegisterBody>, res: Response) => {
  const { username, password, role } = req.body;

    // Verificações básicas de presença de dados
    if (!username || !password) {
        return res.status(400).json({ error: 'Nome de usuário e senha são obrigatórios.' });
    }

  try {
    // Factory Method em Ação:
    // A Factory encapsula a lógica de hash e validação de role.
    const newUser = await UserFactory.create(username, password, role);

    await pool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
      [newUser.username, newUser.passwordHash, newUser.role] // Usa os dados processados pela Factory
    );
    res.status(201).json({ message: 'Usuário registrado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Erro ao registrar usuário' });
  }
});

// Login retornando token com userId, username e role
router.post('/login', async (req: Request<{}, {}, LoginBody>, res: Response) => {
  const { username, password } = req.body;

    // Verificações básicas
    if (!username || !password) {
        return res.status(400).json({ error: 'Nome de usuário e senha são obrigatórios.' });
    }

  try {
    const userResult = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    // Assumindo que o tipo da linha do DB é definido (UserFromDB)
    const user = userResult.rows[0]; 
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    // Certifique-se de que JWT_SECRET está definido no .env
    const secret = process.env.JWT_SECRET as string; 
    
    if (!secret) {
        throw new Error("JWT_SECRET não está configurado.");
    }
    
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
      },
      secret, 
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;