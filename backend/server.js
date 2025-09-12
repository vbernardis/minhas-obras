const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(express.json());

// Porta: Render usa PORT (padrão 10000)
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
    const usuarios = await prisma.usuario.findMany({
      orderBy: { id: 'asc' }
    });
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
       {
        nome,
        email,
        senha,
        tipo: 'usuario',
        ativo: true
      }
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
    const obras = await prisma.obra.findMany({
      orderBy: { id: 'asc' }
    });
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
// ROTAS PARA ORÇAMENTOS
// ========================

// Listar todos os orçamentos com hierarquia completa
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
      },
      orderBy: { id: 'asc' }
    });
    res.json(orcamentos);
  } catch (error) {
    console.error('Erro ao carregar orçamentos:', error);
    res.status(500).json({ erro: 'Erro ao carregar orçamentos' });
  }
});

// Criar um novo orçamento com toda a hierarquia
app.post('/api/orcamentos', async (req, res) => {
  const { obraId, nome, locais } = req.body;

  if (!obraId || !nome) {
    return res.status(400).json({ erro: 'Campos obrigatórios ausentes: obraId e nome' });
  }

  try {
    // Inicia transação para garantir consistência
    const orcamento = await prisma.$transaction(async (prisma) => {
      // Cria o orçamento principal
      const novoOrcamento = await prisma.orcamento.create({
         {
          nome,
          obraId: parseInt(obraId)
        }
      });

      // Para cada Local
      for (const local of locais) {
        const novoLocal = await prisma.local.create({
           {
            nome: local.descricao || 'Local',
            orcamentoId: novoOrcamento.id
          }
        });

        // Para cada Etapa
        for (const etapa of local.etapas || []) {
          const novaEtapa = await prisma.etapa.create({
             {
              nome: etapa.descricao || 'Etapa',
              localId: novoLocal.id
            }
          });

          // Para cada SubEtapa
          for (const subEtapa of etapa.subEtapas || []) {
            const novaSubEtapa = await prisma.subEtapa.create({
               {
                nome: subEtapa.descricao || 'Sub Etapa',
                etapaId: novaEtapa.id
              }
            });

            // Para cada Serviço
            for (const servico of subEtapa.servicos || []) {
              const totalMat = servico.quantidade * servico.valorUnitarioMaterial * (1 + (servico.bdiMaterial || 40) / 100);
              const totalMO = servico.quantidade * servico.valorUnitarioMaoDeObra * (1 + (servico.bdiMaoDeObra || 80) / 100);
              const valorTotal = totalMat + totalMO;

              await prisma.servico.create({
                 {
                  descricao: servico.descricao || 'Serviço',
                  unidade: servico.unidade || '',
                  quantidade: parseFloat(servico.quantidade) || 0,
                  valorUnitarioMaterial: parseFloat(servico.valorUnitarioMaterial) || 0,
                  valorUnitarioMaoDeObra: parseFloat(servico.valorUnitarioMaoDeObra) || 0,
                  bdiMaterial: parseFloat(servico.bdiMaterial) || 40,
                  bdiMaoDeObra: parseFloat(servico.bdiMaoDeObra) || 80,
                  valorTotal,
                  subEtapaId: novaSubEtapa.id
                }
              });
            }
          }
        }
      }

      return novoOrcamento;
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
