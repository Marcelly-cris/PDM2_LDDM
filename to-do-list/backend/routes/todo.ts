import express from 'express';
import pool from '../db'; // sua conexão com o banco
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// ✅ GET - Buscar todos os todos do usuário
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const result = await pool.query(
      'SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar todos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ✅ POST - Criar novo todo
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user?.userId;
    const { task } = req.body;

    if (!task || typeof task !== 'string') {
      return res.status(400).json({ error: 'Campo "task" é obrigatório e deve ser uma string' });
    }

    const result = await pool.query(
      'INSERT INTO todos (user_id, task) VALUES ($1, $2) RETURNING *',
      [userId, task]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar todo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ✅ PUT - Atualizar status (done) do todo
router.put('/:id', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user?.userId;
        const todoId = parseInt(req.params.id, 10);
        
        // CORREÇÃO: Pegue o campo 'status' do corpo da requisição (que é o que o frontend envia)
        const { status } = req.body; 

        if (isNaN(todoId)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        // Validação de Status (Baseado no seu ENUM de banco de dados)
        const allowedStatuses = ['todo', 'in_progress', 'done'];
        if (!allowedStatuses.includes(status)) {
            // Se o frontend enviar { status: 'todos' } (plural), isso retorna 400
            return res.status(400).json({ error: 'Status de tarefa inválido.' });
        }

        // Use o 'status' na query SQL
        const result = await pool.query(
          'UPDATE todos SET status = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *',
          [status, todoId, userId] // $1 agora é a string 'status'
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Todo não encontrado ou não pertence ao usuário' });
        }

        res.json({ message: 'Atualizado com sucesso', todo: result.rows[0] });
    } catch (error) {
        console.error('Erro ao atualizar todo:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ✅ DELETE - Deletar um todo
router.delete('/:id', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user?.userId;
    const todoId = parseInt(req.params.id, 10);

    if (isNaN(todoId)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const result = await pool.query(
      'DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING *',
      [todoId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Todo não encontrado' });
    }

    res.json({ message: 'Deletado com sucesso', todo: result.rows[0] });
  } catch (error) {
    console.error('Erro ao deletar todo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
