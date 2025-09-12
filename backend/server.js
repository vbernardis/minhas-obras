const express = require('express');
const app = express();

// Middleware para JSON
app.use(express.json());

// Porta do Render
const PORT = process.env.PORT || 10000;

// Rota de teste
app.get('/teste', (req, res) => {
  res.json({ mensagem: 'Backend funcionando!' });
});

// Rota simulada de usuários
app.get('/api/usuarios', (req, res) => {
  console.log('✅ /api/usuarios chamado!');
  res.json([
    { id: 1, nome: 'Admin', email: 'admin@obras.com' }
  ]);
});

// Inicializa o servidor em 0.0.0.0:$PORT
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
  console.log('✅ Seu serviço está ativo e pronto!');
});
