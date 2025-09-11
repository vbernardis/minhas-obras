import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [tela, setTela] = useState('login');
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  // Estados para obras
  const [obras, setObras] = useState([]);
  const [nomeObra, setNomeObra] = useState('');
  const [enderecoObra, setEnderecoObra] = useState('');
  const [proprietarioObra, setProprietarioObra] = useState('');
  const [responsavelObra, setResponsavelObra] = useState('');
  const [statusObra, setStatusObra] = useState('planejamento');

  // Estados para usuários
  const [usuarios, setUsuarios] = useState([]);

  // Estado para orçamentos
  const [orcamentos, setOrcamentos] = useState([]);
  const [obraSelecionada, setObraSelecionada] = useState('');
  const [nomeOrcamento, setNomeOrcamento] = useState('');
  const [itens, setItens] = useState([
    { id: 1, nivel: 'local', codigo: '01', descricao: '', total: 0 }
  ]);
  const [bdiMaterialGlobal, setBdiMaterialGlobal] = useState(40);
  const [bdiMaoDeObraGlobal, setBdiMaoDeObraGlobal] = useState(80);
  const [admObras, setAdmObras] = useState(15);

  // ID sequencial para novos itens
  const proximoId = () => Math.max(...itens.map(i => i.id), 0) + 1;

  // Estado para aba ativa
  const [abaAtiva, setAbaAtiva] = useState('dashboard');

  // Carregar dados ao entrar no sistema
  useEffect(() => {
    if (tela === 'sistema') {
      carregarObras();
      carregarUsuarios();
      carregarOrcamentos();
    }
  }, [tela]);

  const carregarObras = async () => {
    try {
      const resposta = await axios.get('https://minhas-obras-backend.onrender.com/api/obras');
      setObras(resposta.data);
    } catch (erro) {
      console.error('Erro ao carregar obras');
    }
  };

  const carregarUsuarios = async () => {
    try {
      const resposta = await axios.get('https://minhas-obras-backend.onrender.com/api/usuarios');
      setUsuarios(resposta.data);
    } catch (erro) {
      console.error('Erro ao carregar usuários');
    }
  };

  const carregarOrcamentos = async () => {
    try {
      const resposta = await axios.get('https://minhas-obras-backend.onrender.com/api/orcamentos');
      setOrcamentos(resposta.data);
    } catch (erro) {
      console.error('Erro ao carregar orçamentos');
    }
  };

  // Função para cadastrar obra
  const cadastrarObra = async (e) => {
    e.preventDefault();
    try {
      const novaObra = {
        nome: nomeObra,
        endereco: enderecoObra,
        proprietario: proprietarioObra,
        responsavel: responsavelObra,
        status: statusObra
      };
      await axios.post('https://minhas-obras-backend.onrender.com/api/obras', novaObra);
      carregarObras();
      setNomeObra('');
      setEnderecoObra('');
      setProprietarioObra('');
      setResponsavelObra('');
      setStatusObra('planejamento');
    } catch (erro) {
      alert('Erro ao cadastrar obra');
    }
  };

  // Função de cadastro
  const cadastrar = async (e) => {
    e.preventDefault();
    setMensagem('');
    try {
      const resposta = await axios.post('https://minhas-obras-backend.onrender.com/api/usuarios', { nome, email, senha });
      setMensagem(resposta.data.mensagem);
      setNome('');
      setEmail('');
      setSenha('');
    } catch (erro) {
      setMensagem(erro.response?.data?.erro || 'Erro de conexão');
    }
  };

  // Função de login
  const logar = async (e) => {
    e.preventDefault();
    setMensagem('');
    try {
      const resposta = await axios.post('https://minhas-obras-backend.onrender.com/api/login', { email, senha });
      setUsuarioLogado(resposta.data);
      setTela('sistema');
      setEmail('');
      setSenha('');
    } catch (erro) {
      setMensagem(erro.response?.data?.erro || 'Erro de conexão');
    }
  };

  // Função de logout
  const sair = () => {
    setUsuarioLogado(null);
    setTela('login');
  };

  // Funções para orçamentos
  const adicionarItem = (nivel) => {
    const id = proximoId();
    let codigo = '';

    switch (nivel) {
      case 'local':
        codigo = `${Math.max(...itens.filter(i => i.nivel === 'local').map(i => parseInt(i.codigo) || 0), 0) + 1}`;
        break;
      case 'etapa':
        codigo = '01.01'; // Será ajustado depois
        break;
      case 'subEtapa':
        codigo = '01.01.01';
        break;
      case 'servico':
        codigo = '01.01.01.01';
        break;
      default:
        codigo = '';
    }

    setItens([...itens, { id, nivel, codigo, descricao: '', unidade: '', quantidade: 1, valorUnitarioMaterial: 0, valorUnitarioMaoDeObra: 0, total: 0 }]);
  };

  const removerItem = (id) => {
    setItens(itens.filter(item => item.id !== id));
  };

  const atualizarItem = (id, campo, valor) => {
    setItens(itens.map(item => item.id === id ? { ...item, [campo]: valor } : item));
  };

  const calcularTotalItem = (item) => {
    if (item.nivel !== 'servico') return 0;
    const valorMat = item.quantidade * item.valorUnitarioMaterial * (1 + bdiMaterialGlobal / 100);
    const valorMO = item.quantidade * item.valorUnitarioMaoDeObra * (1 + bdiMaoDeObraGlobal / 100);
    return valorMat + valorMO;
  };

  const calcularHierarquia = () => {
    const resultado = [...itens].sort((a, b) => a.id - b.id);
    const map = new Map(resultado.map(item => [item.id, { ...item, total: 0 }]));

    // Atualiza totais dos serviços
    for (let item of resultado) {
      if (item.nivel === 'servico') {
        const total = calcularTotalItem(item);
        map.get(item.id).total = total;
      }
    }

    // Soma para níveis superiores
    for (let item of resultado) {
      if (item.nivel === 'local' || item.nivel === 'etapa' || item.nivel === 'subEtapa') {
        let soma = 0;
        let found = false;
        for (let seguido of resultado) {
          if (seguido.id === item.id) found = true;
          else if (found) {
            if (seguido.nivel === 'local') break;
            if (seguido.nivel === 'etapa' && item.nivel === 'local') continue;
            if (seguido.nivel === 'subEtapa' && (item.nivel === 'local' || item.nivel === 'etapa')) continue;
            soma += map.get(seguido.id)?.total || 0;
          }
        }
        map.get(item.id).total = soma;
      }
    }

    return Array.from(map.values());
  };

  const itensComTotais = calcularHierarquia();

  const calcularSubtotal = () => {
    return itensComTotais.reduce((acc, item) => acc + (item.nivel === 'local' ? item.total : 0), 0);
  };

  const calcularTotalFinal = () => {
    return calcularSubtotal() * (1 + admObras / 100);
  };

  const cadastrarOrcamento = async (e) => {
    e.preventDefault();

    if (!obraSelecionada) {
      alert('Selecione uma obra para vincular o orçamento.');
      return;
    }

    try {
      const orcamento = {
        obraId: parseInt(obraSelecionada),
        nome: nomeOrcamento,
        itens: itensComTotais,
        bdiMaterialGlobal,
        bdiMaoDeObraGlobal,
        admObras
      };

      await axios.post('https://minhas-obras-backend.onrender.com/api/orcamentos', orcamento);
      carregarOrcamentos();
      setNomeOrcamento('');
      setObraSelecionada('');
      setItens([{ id: 1, nivel: 'local', codigo: '01', descricao: '', total: 0 }]);
      setBdiMaterialGlobal(40);
      setBdiMaoDeObraGlobal(80);
      setAdmObras(15);
    } catch (erro) {
      console.error('Erro ao cadastrar orçamento', erro);
      alert('Erro ao cadastrar orçamento: ' + (erro.response?.data?.erro || 'Verifique o console'));
    }
  };

  return (
    <div className="App">
      {/* Tela de Login */}
      {tela === 'login' && (
        <div className="tela-login">
          <h1>Minhas Obras</h1>
          <h2>🔐 Entrar no Sistema</h2>
          <form onSubmit={logar}>
            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              placeholder="Senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
            <button type="submit">Entrar</button>
          </form>
          <p>
            <button onClick={() => setTela('cadastro')} className="link">
              Criar uma conta
            </button>
          </p>
          {mensagem && <p className="mensagem">{mensagem}</p>}
        </div>
      )}

      {/* Tela de Cadastro */}
      {tela === 'cadastro' && (
        <div className="tela-cadastro">
          <h1>Minhas Obras</h1>
          <h2>📝 Criar Conta</h2>
          <form onSubmit={cadastrar}>
            <input
              placeholder="Nome completo"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              placeholder="Senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
            <button type="submit">Cadastrar</button>
          </form>
          <p>
            <button onClick={() => setTela('login')} className="link">
              Já tem conta? Entrar
            </button>
          </p>
          {mensagem && <p className="mensagem">{mensagem}</p>}
        </div>
      )}

      {/* Tela do Sistema */}
      {tela === 'sistema' && (
        <div className="tela-sistema">
          <header>
            <h1>Minhas Obras</h1>
            <div className="usuario-logado">
              Olá, <strong>{usuarioLogado?.nome}</strong>
              <button onClick={sair} className="btn-sair">Sair</button>
            </div>
          </header>

          <nav>
            <button onClick={() => setAbaAtiva('dashboard')}>Dashboard</button>
            <button onClick={() => setAbaAtiva('obras')}>Obras</button>
            <button onClick={() => {
              setAbaAtiva('usuarios');
              carregarUsuarios();
            }}>Usuários</button>
            <button onClick={() => {
              setAbaAtiva('orcamentos');
              carregarOrcamentos();
            }}>Orçamentos</button>
          </nav>

          <main>
            {abaAtiva === 'dashboard' && (
              <div>
                <h2>📊 Dashboard</h2>
                <p>Bem-vindo ao painel principal, {usuarioLogado?.nome}!</p>
              </div>
            )}

            {abaAtiva === 'obras' && (
              <div>
                <h2>🏗️ Obras</h2>
                <div className="card">
                  <h3>Cadastrar Nova Obra</h3>
                  <form onSubmit={cadastrarObra}>
                    <input
                      placeholder="Nome da obra"
                      value={nomeObra}
                      onChange={(e) => setNomeObra(e.target.value)}
                      required
                    />
                    <input
                      placeholder="Endereço"
                      value={enderecoObra}
                      onChange={(e) => setEnderecoObra(e.target.value)}
                      required
                    />
                    <input
                      placeholder="Proprietário (opcional)"
                      value={proprietarioObra}
                      onChange={(e) => setProprietarioObra(e.target.value)}
                    />
                    <input
                      placeholder="Responsável (opcional)"
                      value={responsavelObra}
                      onChange={(e) => setResponsavelObra(e.target.value)}
                    />
                    <select
                      value={statusObra}
                      onChange={(e) => setStatusObra(e.target.value)}
                    >
                      <option value="planejamento">Planejamento</option>
                      <option value="em_andamento">Em Andamento</option>
                      <option value="pausada">Pausada</option>
                      <option value="concluida">Concluída</option>
                    </select>
                    <button type="submit">Cadastrar Obra</button>
                  </form>
                </div>

                <div className="card">
                  <h3>Obras Cadastradas ({obras.length})</h3>
                  {obras.length === 0 ? (
                    <p>Nenhuma obra cadastrada ainda.</p>
                  ) : (
                    <ul className="lista-obras">
                      {obras.map(obra => (
                        <li key={obra.id}>
                          <strong>{obra.nome}</strong><br/>
                          <small>{obra.endereco}</small><br/>
                          <span className={`badge status-${obra.status}`}>
                            {obra.status === 'planejamento' && 'Planejamento'}
                            {obra.status === 'em_andamento' && 'Em Andamento'}
                            {obra.status === 'pausada' && 'Pausada'}
                            {obra.status === 'concluida' && 'Concluída'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {abaAtiva === 'usuarios' && (
              <div className="card">
                <h2>👥 Usuários Cadastrados ({usuarios.length})</h2>
                {usuarios.length === 0 ? (
                  <p>Nenhum usuário encontrado.</p>
                ) : (
                  <table className="tabela-usuarios">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Tipo</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map(usuario => (
                        <tr key={usuario.id}>
                          <td>{usuario.nome}</td>
                          <td>{usuario.email}</td>
                          <td>
                            <span className={`badge tipo-${usuario.tipo}`}>
                              {usuario.tipo === 'admin' ? 'Admin' : 
                               usuario.tipo === 'engenheiro' ? 'Engenheiro' : 
                               usuario.tipo === 'gestor' ? 'Gestor' : 'Usuário'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge status-${usuario.ativo}`}>
                              {usuario.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {abaAtiva === 'orcamentos' && (
              <div className="card">
                <h2>🧮 Orçamento - Formato Planilha</h2>
                <form onSubmit={cadastrarOrcamento}>
                  <div style={{ marginBottom: '15px' }}>
                    <label>Obra:</label>
                    <select
                      value={obraSelecionada}
                      onChange={(e) => setObraSelecionada(e.target.value)}
                      required
                      style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    >
                      <option value="">Selecione uma obra</option>
                      {obras.map(obra => (
                        <option key={obra.id} value={obra.id}>
                          {obra.nome} - {obra.endereco}
                        </option>
                      ))}
                    </select>
                  </div>

                  <input
                    placeholder="Nome do orçamento"
                    value={nomeOrcamento}
                    onChange={(e) => setNomeOrcamento(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px', marginBottom: '15px' }}
                  />

                  <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center' }}>
                    <div>
                      <label>BDI Material (%): </label>
                      <input
                        type="number"
                        value={bdiMaterialGlobal}
                        onChange={(e) => setBdiMaterialGlobal(parseFloat(e.target.value) || 0)}
                        style={{ width: '80px', padding: '6px' }}
                      />%
                    </div>
                    <div>
                      <label>BDI MO (%): </label>
                      <input
                        type="number"
                        value={bdiMaoDeObraGlobal}
                        onChange={(e) => setBdiMaoDeObraGlobal(parseFloat(e.target.value) || 0)}
                        style={{ width: '80px', padding: '6px' }}
                      />%
                    </div>
                  </div>

                  <div style={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f1f1f1', fontWeight: 'bold' }}>
                          <th style={{ padding: '8px', width: '70px' }}>Nível</th>
                          <th style={{ padding: '8px', width: '90px' }}>Código</th>
                          <th style={{ padding: '8px' }}>Descrição</th>
                          <th style={{ padding: '8px', width: '80px' }}>Unid.</th>
                          <th style={{ padding: '8px', width: '90px' }}>Qtd</th>
                          <th style={{ padding: '8px', width: '110px' }}>Vl. Mat. Unit</th>
                          <th style={{ padding: '8px', width: '110px' }}>Vl. MO Unit</th>
                          <th style={{ padding: '8px', width: '110px' }}>Total</th>
                          <th style={{ padding: '8px', width: '60px' }}>Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itensComTotais.map((item) => (
                          <tr key={item.id} style={{
                            backgroundColor:
                              item.nivel === 'local' ? '#f0f8ff' :
                              item.nivel === 'etapa' ? '#f5fff0' :
                              item.nivel === 'subEtapa' ? '#fffaf0' : 'white'
                          }}>
                            <td style={{ padding: '6px' }}>
                              <select
                                value=""
                                onChange={(e) => adicionarItem(e.target.value)}
                                style={{ width: '100%' }}
                              >
                                <option value="">+ Adicionar</option>
                                <option value="local">+ Local</option>
                                <option value="etapa">+ Etapa</option>
                                <option value="subEtapa">+ Sub Etapa</option>
                                <option value="servico">+ Serviço</option>
                              </select>
                            </td>
                            <td style={{ padding: '6px' }}>
                              <input
                                type="text"
                                value={item.codigo}
                                onChange={(e) => atualizarItem(item.id, 'codigo', e.target.value)}
                                style={{ width: '100%', fontWeight: 'bold' }}
                                readOnly={item.nivel !== 'servico'}
                              />
                            </td>
                            <td style={{ padding: '6px' }}>
                              <input
                                type="text"
                                value={item.descricao}
                                onChange={(e) => atualizarItem(item.id, 'descricao', e.target.value)}
                                style={{ width: '100%' }}
                              />
                            </td>
                            {item.nivel === 'servico' ? (
                              <>
                                <td style={{ padding: '6px' }}>
                                  <input
                                    type="text"
                                    value={item.unidade}
                                    onChange={(e) => atualizarItem(item.id, 'unidade', e.target.value)}
                                    style={{ width: '100%' }}
                                  />
                                </td>
                                <td style={{ padding: '6px' }}>
                                  <input
                                    type="number"
                                    value={item.quantidade}
                                    onChange={(e) => atualizarItem(item.id, 'quantidade', parseFloat(e.target.value) || 0)}
                                    style={{ width: '100%' }}
                                  />
                                </td>
                                <td style={{ padding: '6px' }}>
                                  <input
                                    type="number"
                                    value={item.valorUnitarioMaterial}
                                    onChange={(e) => atualizarItem(item.id, 'valorUnitarioMaterial', parseFloat(e.target.value) || 0)}
                                    style={{ width: '100%' }}
                                  />
                                </td>
                                <td style={{ padding: '6px' }}>
                                  <input
                                    type="number"
                                    value={item.valorUnitarioMaoDeObra}
                                    onChange={(e) => atualizarItem(item.id, 'valorUnitarioMaoDeObra', parseFloat(e.target.value) || 0)}
                                    style={{ width: '100%' }}
                                  />
                                </td>
                                <td style={{ padding: '6px', fontWeight: 'bold', color: '#27ae60' }}>
                                  R$ {calcularTotalItem(item).toFixed(2)}
                                </td>
                              </>
                            ) : (
                              <td colSpan={6} style={{ textAlign: 'right', fontWeight: 'bold', color: '#2c3e50' }}>
                                Total: R$ {item.total.toFixed(2)}
                              </td>
                            )}
                            <td style={{ padding: '6px' }}>
                              <button
                                type="button"
                                onClick={() => removerItem(item.id)}
                                style={{ background: '#e53e3e', color: 'white', border: 'none', padding: '4px 6px', cursor: 'pointer' }}
                              >
                                X
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <label>ADM de Obras (%): </label>
                      <input
                        type="number"
                        value={admObras}
                        onChange={(e) => setAdmObras(parseFloat(e.target.value) || 0)}
                        style={{ width: '80px', padding: '6px' }}
                      />%
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div>Subtotal: R$ {calcularSubtotal().toFixed(2)}</div>
                      <div style={{ fontWeight: 'bold', fontSize: '1.2em', color: '#2c3e50' }}>
                        Total Final: R$ {calcularTotalFinal().toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    style={{
                      marginTop: '20px',
                      padding: '12px 24px',
                      backgroundColor: '#27ae60',
                      color: 'white',
                      border: 'none',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Cadastrar Orçamento
                  </button>
                </form>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
