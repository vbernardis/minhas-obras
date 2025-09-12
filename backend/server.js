const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(express.json());

// Porta: obrigatório usar PORT do Render
const PORT = process.env.PORT || 10000;

// 🔥 ROTA DE TESTE
app.get('/teste', (req, res) => {
  res.json({ mensagem: 'Backend funcionando!' });
});

// ====================
// ROTAS SIMPLIFICADAS
// ====================

// GET /api/usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      orderBy: { id: 'asc' }
    });
    res.json(usuarios);
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    res.status(500).json({ erro: 'Erro ao carregar usuários' });
  }
});

// POST /api/usuarios
app.post('/api/usuarios', async (req, res) => {
  const { nome, email, senha } = req.body;
  try {
    const usuario = await prisma.usuario.create({
       { nome, email, senha, tipo: 'usuario', ativo: true }
    });
    res.status(201).json(usuario);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ erro: 'Erro ao criar usuário' });
  }
});

// ====================
// INICIALIZAÇÃO SEGURA
// ====================

async function startServer() {
  try {
    await prisma.$connect;
    console.log('✅ Banco de dados conectado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:', error);
    process.exit(1); // Interrompe se não conectar
  }

  // ✅ ESCUTA EM 0.0.0.0 E NA PORTA DO RENDER
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
    console.log('✅ Seu serviço está ativo e pronto para receber requisições!');
  });
}

startServer();
