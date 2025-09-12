const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(express.json());

// Porta: obrigatório usar a variável de ambiente do Render
const PORT = process.env.PORT || 10000;

// 🔥 ROTA DE TESTE
app.get('/teste', (req, res) => {
  res.json({ mensagem: 'Backend funcionando!' });
});

// ====================
// ROTAS PARA USUÁRIOS
// ====================

// GET /api/usuarios - Carrega todos os usuários
app.get('/api/usuarios', async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      orderBy: { id: 'asc' }
    });
    console.log('✅ Usuários carregados:', usuarios.length);
    res.json(usuarios);
  } catch (error) {
    console.error('❌ Erro ao carregar usuários:', error);
    res.status(500).json({ erro: 'Erro ao carregar usuários' });
  }
});

// POST /api/usuarios - Cria um novo usuário
app.post('/api/usuarios', async (req, res) => {
  const { nome, email, senha } = req.body;
  console.log('📥 POST /api/usuarios recebido:', { nome, email });

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Campos obrigatórios: nome, email, senha' });
  }

  try {
    const usuario = await prisma.usuario.create({
       {
        nome,
        email,
        senha,
        tipo: 'usuario',
        ativo: true
      }
    });
    console.log('✅ Usuário criado com ID:', usuario.id);
    res.status(201).json(usuario);
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    res.status(500).json({ erro: 'Erro ao criar usuário' });
  }
});

// POST /api/login - Login simples
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;
  console.log('🔐 Tentativa de login:', email);

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
  }

  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario || usuario.senha !== senha) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }
    console.log('✅ Login bem-sucedido:', usuario.email);
    res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo
    });
  } catch (error) {
    console.error('❌ Erro ao fazer login:', error);
    res.status(500).json({ erro: 'Erro ao fazer login' });
  }
});

// ====================
// INICIALIZAÇÃO DO SERVIDOR
// ====================

async function startServer() {
  try {
    await prisma.$connect;
    console.log('✅ Banco de dados conectado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  }

  // ✅ ESCUTA EM 0.0.0.0 E NA PORTA DO RENDER
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
    console.log('✅ Seu serviço está ativo e pronto para receber requisições!');
  });
}

startServer();
