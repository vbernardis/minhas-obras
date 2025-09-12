const express = require('express');
const app = express();

// Middleware
app.use(express.json());

// ✅ Usa a porta do ambiente (obrigatório no Render)
const PORT = process.env.PORT || 10000;

// 🔥 Rota de teste
app.get('/teste', (req, res) => {
  res.json({ mensagem: 'Backend funcionando!' });
});

// ✅ Rota simulada para usuários
app.get('/api/usuarios', (req, res) => {
  console.log('✅ Rota /api/usuarios chamada!');
  res.json([
    { id: 1, nome: 'Admin', email: 'admin@obras.com' }
  ]);
});

// ====================
// INICIALIZAÇÃO DO SERVIDOR
// ====================

// ✅ ESCUTA EM 0.0..0 E NA PORTA DO RENDER
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
  console.log('✅ Seu serviço está ativo e pronto para receber requisições!');
});
