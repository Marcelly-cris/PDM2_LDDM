import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/auth';
import todoRoutes from './routes/todo';

// Importando middlewares para autenticação e autorização
import { authenticateToken, permitRoles } from './middleware/authMiddleware';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
console.log('Rota /auth carregada');

app.use('/todos', todoRoutes);
console.log('Rota /todo carregada');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
