const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Middleware essencial
app.use(express.json());

// Porta: usa PORT (Render) ou fallback para 10000
const PORT = process.env.PORT || 10000;

// Rota de teste
app.get('/teste', (req, res) => {
  res.json({ mensagem: 'Backend funcionando!' });
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
    res.status(500).json({ erro: 'Erro ao criar usuário' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
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
    res.status(500).json({ erro: 'Erro ao cadastrar obra' });
  }
});

// ========================
// ROTAS PARA ORÇAMENTOS
// ========================

app.get('/api/orcamentos', async (req, res) => {
  try {
    const orcamentos = await prisma.orcamento.findMany({
      include: {
        obra: true,
        locais: {
          include: {
            etapas: {
              include: {
                subEtapas: {
                  include: {
                    servicos: true
                  }
                }
              }
            }
          }
        }
      }
    });
    res.json(orcamentos);
  } catch (error) {
    console.error('Erro ao carregar orçamentos:', error);
    res.status(500).json({ erro: 'Erro ao carregar orçamentos' });
  }
});

app.post('/api/orcamentos', async (req, res) => {
  const { obraId, nome, locais } = req.body;

  if (!obraId || !nome) {
    return res.status(400).json({ erro: 'Campos obrigatórios ausentes' });
  }

  try {
    const orcamento = await prisma.$transaction(async (prisma) => {
      const novo = await prisma.orcamento.create({
        data: { nome, obraId: parseInt(obraId) }
      });

      for (const local of locais) {
        const l = await prisma.local.create({
          data: { nome: local.descricao || 'Local', orcamentoId: novo.id }
        });

        for (const etapa of local.etapas || []) {
          const e = await prisma.etapa.create({
            data: { nome: etapa.descricao || 'Etapa', localId: l.id }
          });

          for (const sub of etapa.subEtapas || []) {
            const s = await prisma.subEtapa.create({
              data: { nome: sub.descricao || 'Sub Etapa', etapaId: e.id }
            });

            for (const servico of sub.servicos || []) {
              const totalMat = servico.quantidade * servico.valorUnitarioMaterial * (1 + (servico.bdiMaterial || 40) / 100);
              const totalMO = servico.quantidade * servico.valorUnitarioMaoDeObra * (1 + (servico.bdiMaoDeObra || 80) / 100);

              await prisma.servico.create({
                data: {
                  descricao: servico.descricao || 'Serviço',
                  unidade: servico.unidade || '',
                  quantidade: parseFloat(servico.quantidade) || 0,
                  valorUnitarioMaterial: parseFloat(servico.valorUnitarioMaterial) || 0,
                  valorUnitarioMaoDeObra: parseFloat(servico.valorUnitarioMaoDeObra) || 0,
                  bdiMaterial: parseFloat(servico.bdiMaterial) || 40,
                  bdiMaoDeObra: parseFloat(servico.bdiMaoDeObra) || 80,
                  valorTotal: totalMat + totalMO,
                  subEtapaId: s.id
                }
              });
            }
          }
        }
      }

      return novo;
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

async function startServer() {
  try {
    await prisma.$connect;
    console.log('Conectado ao banco de dados com sucesso!');
  } catch (error) {
    console.error('Erro ao conectar ao banco:', error);
    process.exit(1);
  }

  // Escutar em 0.0.0.0 e na porta correta
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
    console.log('==> Seu serviço está ativo 🎉');
  });
}

startServer();
