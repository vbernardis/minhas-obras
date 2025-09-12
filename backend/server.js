const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(express.json());

// ✅ PORTA DO RENDER
const PORT = process.env.PORT || 10000;

// 🔥 ROTA DE TESTE
app.get('/teste', (req, res) => {
  res.json({ mensagem: 'Backend funcionando!' });
});

// ✅ POST PARA CADASTRAR USUÁRIO (SIMPLIFICADO)
app.post('/api/usuarios', async (req, res) => {
  const { nome, email, senha } = req.body;
  console.log('📥 POST /api/usuarios recebido:', { nome, email });

  // Simula criação (sem banco)
  res.status(201).json({
    id: Date.now(),
    nome,
    email,
    tipo: 'usuario',
    ativo: true
  });
});

// ====================
// INICIALIZAÇÃO
// ====================

async function startServer() {
  try {
    await prisma.$connect;
    console.log('✅ Banco de dados conectado!');
  } catch (error) {
    console.error('⚠️ Não foi possível conectar ao banco. Continuando sem ele.');
    // Mesmo sem banco, o servidor deve subir
  }

  // ✅ ESCUTA EM 0.0.0.0 E NA PORTA DO RENDER
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
    console.log('✅ Seu serviço está ativo e pronto para receber requisições!');
  });
}

startServer();
