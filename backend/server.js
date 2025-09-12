const express = require('express');
const app = express();

// Middleware
app.use(express.json());

// ✅ PORTA DO RENDER
const PORT = process.env.PORT || 10000;

// 🔥 ROTA DE TESTE
app.get('/teste', (req, res) => {
  res.json({ mensagem: 'Backend funcionando!' });
});

// ✅ ROTA SIMPLIFICADA PARA USUÁRIOS
app.get('/api/usuarios', (req, res) => {
  console.log('✅ /api/usuarios chamado!');
  res.json([
    { id: 1, nome: 'Teste', email: 'teste@obras.com' }
  ]);
});

// ====================
// INICIALIZAÇÃO
// ====================

// ✅ ESCUTA EM 0.0.0.0 E NA PORTA DO RENDER
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
  console.log('✅ Seu serviço está ativo e pronto para receber requisições!');
});
