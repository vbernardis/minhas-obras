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

// ====================
// ROTAS PARA USUÁRIOS
// ====================

app.get('/api/usuarios', async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      orderBy: { id: 'asc' }
    });
    res.json(usuarios);
  } catch (error) {
    console.error('Erro ao carregar usuarios:', error);
    res.status(500).json({ erro: 'Erro ao carregar usuarios' });
  }
});

app.post('/api/usuarios', async (req, res) => {
  const { nome, email, senha } = req.body;
  try {
    const usuario = await prisma.usuario.create({
       { nome, email, senha, tipo: 'usuario', ativo: true }
    });
    res.status(201).json(usuario);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar usuario' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario || usuario.senha !== senha) {
      return res.status(401).json({ erro: 'Credenciais invalidas' });
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
// ====================

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
       {
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
// ROTAS PARA ORCAMENTOS
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
    console.error('Erro ao carregar orcamentos:', error);
    res.status(500).json({ erro: 'Erro ao carregar orcamentos' });
  }
});

app.post('/api/orcamentos', async (req, res) => {
  const { obraId, nome, bdiMaterialGlobal, bdiMaoDeObraGlobal, admObras, locais } = req.body;

  if (!obraId || !nome || !locais) {
    return res.status(400).json({ erro: 'Campos obrigatorios ausentes' });
  }

  try {
    const orcamento = await prisma.$transaction(async (prisma) => {
      const novo = await prisma.orcamento.create({
         {
          nome,
          obraId: parseInt(obraId),
          bdiMaterialGlobal: parseFloat(bdiMaterialGlobal) || 40,
          bdiMaoDeObraGlobal: parseFloat(bdiMaoDeObraGlobal) || 80,
          admObras: parseFloat(admObras) || 15
        }
      });

      for (const local of locais) {
        const l = await prisma.local.create({
           { nome: local.descricao || 'Local', orcamentoId: novo.id }
        });

        for (const etapa of local.etapas || []) {
          const e = await prisma.etapa.create({
             { nome: etapa.descricao || 'Etapa', localId: l.id }
          });

          for (const sub of etapa.subEtapas || []) {
            const s = await prisma.subEtapa.create({
               { nome: sub.descricao || 'Sub Etapa', etapaId: e.id }
            });

            for (const servico of sub.servicos || []) {
              const totalMat = (servico.quantidade || 0) * (servico.valorUnitarioMaterial || 0) * (1 + (servico.bdiMaterial || 40) / 100);
              const totalMO = (servico.quantidade || 0) * (servico.valorUnitarioMaoDeObra || 0) * (1 + (servico.bdiMaoDeObra || 80) / 100);

              await prisma.servico.create({
                 {
                  descricao: servico.descricao || 'Servico',
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
    console.error('Erro ao salvar orcamento:', error);
    res.status(500).json({ erro: 'Erro ao salvar orcamento' });
  }
});

// ====================
// INICIALIZAÇÃO
// ====================

async function startServer() {
  try {
    await prisma.$connect;
    console.log('✅ Banco de dados conectado!');
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
