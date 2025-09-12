const express = require('express');
const app = express();

// Middleware para parsear JSON
app.use(express.json());

// ✅ PORTA DO RENDER: Usa a variável de ambiente
const PORT = process.env.PORT || 10000;

// 🔥 ROTA DE TESTE (funciona)
app.get('/teste', (req, res) => {
  res.json({ mensagem: 'Backend funcionando!' });
});

// ✅ ROTA SIMPLIFICADA PARA USUÁRIOS (sem banco)
app.get('/api/usuarios', (req, res) => {
  console.log('✅ Rota /api/usuarios chamada com sucesso!');
  res.json([
    { id: 1, nome: 'Admin', email: 'admin@obras.com', tipo: 'admin' },
    { id: 2, nome: 'Engenheiro', email: 'eng@obras.com', tipo: 'engenheiro' }
  ]);
});

// ✅ POST simples para login
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;
  if (email && senha) {
    res.json({ id: 1, nome: 'Usuário Teste', email });
  } else {
    res.status(401).json({ erro: 'Credenciais inválidas' });
  }
});

// ====================
// INICIALIZAÇÃO DO SERVIDOR
// ====================

// ✅ ESCUTA EM 0.0.0.0 E NA PORTA DO RENDER
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
  console.log('✅ Seu serviço está ativo e pronto para receber requisições!');
});
