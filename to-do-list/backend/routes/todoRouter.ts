import express from 'express';
import { authenticateToken, permitRoles } from '../middleware/authMiddleware';

const router = express.Router();

// Rota que qualquer usuário autenticado com esses papéis pode acessar
router.get(
  '/',
  authenticateToken,
  permitRoles('visualizacao', 'gerencial', 'administrativo'),
  async (req, res) => {
    // Sua lógica para listar os todos aqui
    res.json({ message: 'Todos listados para papel autorizado' });
  }
);

// Rota que apenas administradores podem acessar para deletar
router.delete(
  '/:id',
  authenticateToken,
  permitRoles('administrativo'),
  async (req, res) => {
    // Sua lógica para deletar o todo
    res.json({ message: 'Todo deletado por admin' });
  }
);

export default router;
