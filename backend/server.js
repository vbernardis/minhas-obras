const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(express.json());

// Porta: usa 10000 (padrão do Render) ou PORT
const PORT = process.env.PORT || 10000;

// Rota de teste
app.get('/teste', (req, res) => {
  res.json({ mensagem: 'Servidor funcionando!' });
});

// ====================
// ROTAS PARA USUÁRIOS
// ====================

app.get('/api/usuarios', async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany();
    res.json(usuarios);
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    res.status(500).json({ erro: 'Erro ao carregar usuários' });
  }
});

app.post('/api/usuarios', async (req, res) => {
  const { nome, email, senha } = req.body;
  try {
    const usuario = await prisma.usuario.create({
      data: { nome, email, senha, tipo: 'usuario', ativo: true }
    });
    res.status(201).json(usuario);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ erro: 'Erro ao criar usuário' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });
    if (!usuario || usuario.senha !== senha) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }
    res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao fazer login' });
  }
});

// ==================
// ROTAS PARA OBRAS
// ==================

app.get('/api/obras', async (req, res) => {
  try {
    const obras = await prisma.obra.findMany();
    res.json(obras);
  } catch (error) {
    console.error('Erro ao carregar obras:', error);
    res.status(500).json({ erro: 'Erro ao carregar obras' });
  }
});

app.post('/api/obras', async (req, res) => {
  const { nome, endereco, proprietario, responsavel, status } = req.body;
  try {
    const obra = await prisma.obra.create({
      data: {
        nome,
        endereco,
        proprietario: proprietario || '',
        responsavel: responsavel || '',
        status: status || 'planejamento'
      }
    });
    res.status(201).json(obra);
  } catch (error) {
    console.error('Erro ao cadastrar obra:', error);
    res.status(500).json({ erro: 'Erro ao cadastrar obra' });
  }
});

// ========================
// ROTAS PARA ORÇAMENTOS
// ========================

app.get('/api/orcamentos', async (req, res) => {
  try {
    const orcamentos = await prisma.orcamento.findMany({
      include: { obra: true }
    });
    // Converte locais de string para objeto JSON
    const orcamentosParseados = orcamentos.map(o => ({
      ...o,
      locais: typeof o.locais === 'string' ? JSON.parse(o.locais) : o.locais,
      bdiMaterialGlobal: parseFloat(o.bdiMaterialGlobal),
      bdiMaoDeObraGlobal: parseFloat(o.bdiMaoDeObraGlobal),
      admObras: parseFloat(o.admObras)
    }));
    res.json(orcamentosParseados);
  } catch (error) {
    console.error('Erro ao carregar orçamentos:', error);
    res.status(500).json({ erro: 'Erro ao carregar orçamentos' });
  }
});

app.post('/api/orcamentos', async (req, res) => {
  const { obraId, nome, locais, bdiMaterialGlobal, bdiMaoDeObraGlobal, admObras } = req.body;

  if (!obraId || !nome) {
    return res.status(400).json({ erro: 'Campos obrigatórios ausentes' });
  }

  try {
    const orcamento = await prisma.orcamento.create({
      data: {
        obraId: parseInt(obraId),
        nome,
        bdiMaterialGlobal: parseFloat(bdiMaterialGlobal) || 40,
        bdiMaoDeObraGlobal: parseFloat(bdiMaoDeObraGlobal) || 80,
        admObras: parseFloat(admObras) || 15,
        locais: JSON.stringify(locais)
      }
    });
    res.status(201).json(orcamento);
  } catch (error) {
    console.error('Erro ao salvar orçamento:', error);
    res.status(500).json({ erro: 'Erro ao salvar orçamento' });
  }
});

// ====================
// INICIALIZAÇÃO
// ====================

async function main() {
  try {
    await prisma.$connect;
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log('==> Seu serviço está ativo 🎉');
  } catch (error) {
    console.error('Erro ao conectar ao banco:', error);
    process.exit(1);
  }
}

main();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escutando na porta ${PORT}`);
});
