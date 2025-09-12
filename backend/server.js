const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(express.json());

// Porta para o Render
const PORT = process.env.PORT || 10000;

// Rota de teste
app.get('/teste', (req, res) => {
  res.json({ mensagem: 'Servidor funcionando!' });
});

// ====================
// ROTAS PARA USUÁRIOS
// ====================

app.post('/api/usuarios', async (req, res) => {
  const { nome, email, senha } = req.body;
  try {
    const usuario = await prisma.usuario.create({
      data: { nome, email, senha }
    });
    res.status(201).json(usuario);
  } catch (error) {
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
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao fazer login' });
  }
});

app.get('/api/usuarios', async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao carregar usuários' });
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
        proprietario,
        responsavel,
        status
      }
    });
    res.status(201).json(obra);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao cadastrar obra' });
  }
});

// ========================
// ROTAS PARA ORÇAMENTOS
// ========================

app.get('/api/orcamentos', async (req, res) => {
  try {
    const orcamentos = await prisma.orcamento.findMany();
    // Converte os campos JSON string de volta para objetos
    const orcamentosParseados = orcamentos.map(o => ({
      ...o,
      locais: typeof o.locais === 'string' ? JSON.parse(o.locais) : o.locais
    }));
    res.json(orcamentosParseados);
  } catch (error) {
    console.error('Erro ao carregar orçamentos:', error);
    res.status(500).json({ erro: 'Erro ao carregar orçamentos' });
  }
});

app.post('/api/orcamentos', async (req, res) => {
  const { obraId, nome, locais, bdiMaterialGlobal, bdiMaoDeObraGlobal, admObras } = req.body;

  try {
    const orcamento = await prisma.orcamento.create({
      data: {
        obraId: parseInt(obraId),
        nome,
        bdiMaterialGlobal: parseFloat(bdiMaterialGlobal) || 40,
        bdiMaoDeObraGlobal: parseFloat(bdiMaoDeObraGlobal) || 80,
        admObras: parseFloat(admObras) || 15,
        locais: JSON.stringify(locais) // Salva como string JSON
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
  await prisma.$connect;
  console.log('Conectado ao banco de dados com sucesso!');
}

main().catch((e) => {
  console.error('Erro ao conectar ao banco:', e);
  process.exit(1);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log('==> Seu serviço está ativo 🎉');
});
