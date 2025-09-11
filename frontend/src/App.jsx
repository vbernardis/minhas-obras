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
    { nivel: 'servico', codigo: '', descricao: '', unidade: '', quantidade: 1, valorUnitarioMaterial: 0, valorUnitarioMaoDeObra: 0, bdiMaterial: 40, bdiMaoDeObra: 80 }
  ]);
  const [admObras, setAdmObras] = useState(15); // % de ADM de Obras

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
  const adicionarItem = () => {
    setItens([...itens, {
      nivel: 'servico',
      codigo: '',
      descricao: '',
      unidade: '',
      quantidade: 1,
      valorUnitarioMaterial: 0,
      valorUnitarioMaoDeObra: 0,
      bdiMaterial: 40,
      bdiMaoDeObra: 80
    }]);
  };

  const removerItem = (index) => {
    const novos = [...itens];
    novos.splice(index, 1);
    setItens(novos);
  };

  const atualizarItem = (index, campo, valor) => {
    const novos = [...itens];
    novos[index][campo] = valor;
    setItens(novos);
  };

  const calcularTotalItem = (item) => {
    const totalMat = item.quantidade * item.valorUnitarioMaterial * (1 + (item.bdiMaterial || 0) / 100);
    const totalMO = item.quantidade * item.valorUnitarioMaoDeObra * (1 + (item.bdiMaoDeObra || 0) / 100);
    return totalMat + totalMO;
  };

  const calcularSubtotal = () => {
    return itens.reduce((acc, item) => acc + calcularTotalItem(item), 0);
  };

  const calcularTotalFinal = () => {
    const subtotal = calcularSubtotal();
    return subtotal * (1 + admObras / 100);
  };

  const gerarCodigoAutomatico = (nivel, index) => {
  const prefixos = {
    local: `${index + 1}`,
    etapa: `${Math.floor(index / 10) + 1}.${(index % 10) + 1}`,
    subEtapa: `${Math.floor(index / 100) + 1}.${Math.floor((index % 100) / 10) + 1}.${(index % 10) + 1}`,
    servico: `${Math.floor(index / 1000) + 1}.${Math.floor((index % 1000) / 100) + 1}.${Math.floor((index % 100) / 10) + 1}.${(index % 10) + 1}`
  };
  return prefixos[nivel] || '';
};

const atualizarNivel = (index, novoNivel) => {
  const novos = [...itens];
  novos[index].nivel = novoNivel;
  novos[index].codigo = gerarCodigoAutomatico(novoNivel, index);
  setItens(novos);
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
        itens,
        admObras
      };

      await axios.post('https://minhas-obras-backend.onrender.com/api/orcamentos', orcamento);
      carregarOrcamentos();
      setNomeOrcamento('');
      setObraSelecionada('');
      setItens([
        { nivel: 'servico', codigo: '', descricao: '', unidade: '', quantidade: 1, valorUnitarioMaterial: 0, valorUnitarioMaoDeObra: 0, bdiMaterial: 40, bdiMaoDeObra: 80 }
      ]);
      setAdmObras(15);
    } catch (erro) {
      alert('Erro ao cadastrar orçamento');
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
                <h2>🧮 Orçamento - Formato Simplificado</h2>
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

                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f1f1', fontWeight: 'bold' }}>
                        <th style={{ padding: '8px', width: '60px' }}>Nível</th>
                        <th style={{ padding: '8px', width: '80px' }}>Código</th>
                        <th style={{ padding: '8px' }}>Descrição</th>
                        <th style={{ padding: '8px', width: '70px' }}>Unid.</th>
                        <th style={{ padding: '8px', width: '80px' }}>Qtd</th>
                        <th style={{ padding: '8px', width: '100px' }}>Vl. Mat. Unit</th>
                        <th style={{ padding: '8px', width: '80px' }}>BDI Mat.</th>
                        <th style={{ padding: '8px', width: '100px' }}>Vl. MO Unit</th>
                        <th style={{ padding: '8px', width: '80px' }}>BDI MO</th>
                        <th style={{ padding: '8px', width: '100px' }}>Total</th>
                        <th style={{ padding: '8px', width: '60px' }}>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itens.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: '6px' }}>
                            <select
                              value={item.nivel}
                              onChange={(e) => atualizarNivel(idx, e.target.value)}
                              style={{ width: '100%' }}
                            >
                              <option value="local">Local</option>
                              <option value="etapa">Etapa</option>
                              <option value="subEtapa">Sub Etapa</option>
                              <option value="servico">Serviço</option>
                            </select>
                          </td>
                          <td style={{ padding: '6px' }}>
                            <input
                              type="text"
                              value={item.codigo}
                              onChange={(e) => atualizarItem(idx, 'codigo', e.target.value)}
                              style={{ width: '100%' }}
                            />
                          </td>
                          <td style={{ padding: '6px' }}>
                            <input
                              type="text"
                              value={item.descricao}
                              onChange={(e) => atualizarItem(idx, 'descricao', e.target.value)}
                              style={{ width: '100%' }}
                            />
                          </td>
                          <td style={{ padding: '6px' }}>
                            <input
                              type="text"
                              value={item.unidade}
                              onChange={(e) => atualizarItem(idx, 'unidade', e.target.value)}
                              style={{ width: '100%' }}
                            />
                          </td>
                          <td style={{ padding: '6px' }}>
                            <input
                              type="number"
                              value={item.quantidade}
                              onChange={(e) => atualizarItem(idx, 'quantidade', parseFloat(e.target.value) || 0)}
                              style={{ width: '100%' }}
                            />
                          </td>
                          <td style={{ padding: '6px' }}>
                            <input
                              type="number"
                              value={item.valorUnitarioMaterial}
                              onChange={(e) => atualizarItem(idx, 'valorUnitarioMaterial', parseFloat(e.target.value) || 0)}
                              style={{ width: '100%' }}
                            />
                          </td>
                          <td style={{ padding: '6px' }}>
                            <input
                              type="number"
                              value={item.bdiMaterial}
                              onChange={(e) => atualizarItem(idx, 'bdiMaterial', parseFloat(e.target.value) || 0)}
                              style={{ width: '100%' }}
                            />%
                          </td>
                          <td style={{ padding: '6px' }}>
                            <input
                              type="number"
                              value={item.valorUnitarioMaoDeObra}
                              onChange={(e) => atualizarItem(idx, 'valorUnitarioMaoDeObra', parseFloat(e.target.value) || 0)}
                              style={{ width: '100%' }}
                            />
                          </td>
                          <td style={{ padding: '6px' }}>
                            <input
                              type="number"
                              value={item.bdiMaoDeObra}
                              onChange={(e) => atualizarItem(idx, 'bdiMaoDeObra', parseFloat(e.target.value) || 0)}
                              style={{ width: '100%' }}
                            />%
                          </td>
                          <td style={{ padding: '6px', fontWeight: 'bold', color: '#27ae60' }}>
                            R$ {calcularTotalItem(item).toFixed(2)}
                          </td>
                          <td style={{ padding: '6px' }}>
                            <button
                              type="button"
                              onClick={() => removerItem(idx)}
                              style={{ background: '#e53e3e', color: 'white', border: 'none', padding: '4px 6px', cursor: 'pointer' }}
                            >
                              X
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <button type="button" onClick={adicionarItem} style={{ marginTop: '15px' }}>+ Adicionar Item</button>

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
