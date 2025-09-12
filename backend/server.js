const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(express.json());

// Porta do Render
const PORT = process.env.PORT || 10000;

// Rota de teste
app.get('/teste', (req, res) => {
  res.json({ mensagem: 'Backend funcionando!' });
});

// Rota simulada de usuários (sem banco)
app.get('/api/usuarios', (req, res) => {
  console.log('✅ /api/usuarios chamado!');
  res.json([
    { id: 1, nome: 'Admin', email: 'admin@obras.com' }
  ]);
});

// Inicializa o servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
});
