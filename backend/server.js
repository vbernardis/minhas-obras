// server.js

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Permite que o frontend se comunique
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/teste', (req, res) => {
  res.json({ mensagem: 'Servidor funcionando!' });
});

// Rota: Listar todos os usuários
app.get('/api/usuarios', async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        ativo: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(usuarios);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar usuários' });
    console.error(erro);
  }
});

// Rota: Cadastro de usuário
app.post('/api/usuarios', async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Preencha todos os campos' });
  }

  try {
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email }
    });

    if (usuarioExistente) {
      return res.status(400).json({ erro: 'Este email já está cadastrado' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash
      }
    });

    res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
      mensagem: 'Usuário cadastrado com sucesso!'
    });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro no servidor' });
    console.error(erro);
  }
});

// Rota: Login
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Preencha email e senha' });
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!usuario) {
      return res.status(400).json({ erro: 'Email ou senha inválidos' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(400).json({ erro: 'Email ou senha inválidos' });
    }

    res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
      mensagem: `Bem-vindo(a), ${usuario.nome}!`
    });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro no servidor' });
    console.error(erro);
  }
});

// Rota: Listar todas as obras
app.get('/api/obras', async (req, res) => {
  try {
    const obras = await prisma.obra.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(obras);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar obras' });
    console.error(erro);
  }
});

// Rota: Cadastrar uma nova obra
app.post('/api/obras', async (req, res) => {
  const { nome, endereco, proprietario, responsavel, status } = req.body;

  if (!nome || !endereco) {
    return res.status(400).json({ erro: 'Nome e endereço são obrigatórios' });
  }

  try {
    const obra = await prisma.obra.create({
      data: {
        nome,
        endereco,
        proprietario,
        responsavel,
        status: status || 'planejamento'
      }
    });
    res.json(obra);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao cadastrar obra' });
    console.error(erro);
  }
});

// Rota: Listar orçamentos
app.get('/api/orcamentos', async (req, res) => {
  try {
    const orcamentos = await prisma.orcamento.findMany({
      include: { itens: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orcamentos);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar orçamentos' });
  }
});

// Rota: Cadastrar orçamento
app.post('/api/orcamentos', async (req, res) => {
  const { obraId, nome, itens } = req.body;

  if (!obraId || !nome || !itens || itens.length === 0) {
    return res.status(400).json({ erro: 'Preencha todos os dados' });
  }

  try {
    const orcamento = await prisma.orcamento.create({
      data: {
        nome,
        obraId,
        valorTotal: itens.reduce((acc, item) => acc + (item.quantidade * item.valorUnitario), 0),
        itens: {
          create: itens.map(item => ({
            descricao: item.descricao,
            quantidade: item.quantidade,
            valorUnitario: item.valorUnitario,
            valorTotal: item.quantidade * item.valorUnitario
          }))
        }
      },
      include: { itens: true }
    });
    res.json(orcamento);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao cadastrar orçamento' });
    console.error(erro);
  }
});

// Inicia o servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
