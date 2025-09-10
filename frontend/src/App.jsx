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
  const [locais, setLocais] = useState([
    {
      nome: '',
      etapas: [
        {
          nome: '',
          subEtapas: [
            {
              nome: '',
              servicos: [
                {
                  descricao: '',
                  unidade: '',
                  quantidade: 1,
                  valorUnitarioMaterial: 0,
                  valorUnitarioMaoDeObra: 0,
                  bdiMaterial: 40,
                  bdiMaoDeObra: 80
                }
              ]
            }
          ]
        }
      ]
    }
  ]);

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
  const adicionarLocal = () => {
    setLocais([...locais, {
      nome: '',
      etapas: []
    }]);
  };

  const adicionarEtapa = (idxLocal) => {
    const novos = [...locais];
    novos[idxLocal].etapas.push({
      nome: '',
      subEtapas: []
    });
    setLocais(novos);
  };

  const adicionarSubEtapa = (idxLocal, idxEtapa) => {
    const novos = [...locais];
    novos[idxLocal].etapas[idxEtapa].subEtapas.push({
      nome: '',
      servicos: []
    });
    setLocais(novos);
  };

  const adicionarServico = (idxLocal, idxEtapa, idxSub) => {
    const novos = [...locais];
    novos[idxLocal].etapas[idxEtapa].subEtapas[idxSub].servicos.push({
      descricao: '',
      unidade: '',
      quantidade: 1,
      valorUnitarioMaterial: 0,
      valorUnitarioMaoDeObra: 0,
      bdiMaterial: 40,
      bdiMaoDeObra: 80
    });
    setLocais(novos);
  };

  const removerServico = (idxLocal, idxEtapa, idxSub, idxServico) => {
    const novos = [...locais];
    novos[idxLocal].etapas[idxEtapa].subEtapas[idxSub].servicos =
      novos[idxLocal].etapas[idxEtapa].subEtapas[idxSub].servicos.filter((_, i) => i !== idxServico);
    setLocais(novos);
  };

  const atualizarServico = (idxLocal, idxEtapa, idxSub, idxServico, campo, valor) => {
    const novos = [...locais];
    novos[idxLocal].etapas[idxEtapa].subEtapas[idxSub].servicos[idxServico][campo] = valor;
    setLocais(novos);
  };

  const calcularTotalItem = (servico) => {
    const totalMat = servico.quantidade * servico.valorUnitarioMaterial * (1 + (servico.bdiMaterial || 40) / 100);
    const totalMO = servico.quantidade * servico.valorUnitarioMaoDeObra * (1 + (servico.bdiMaoDeObra || 80) / 100);
    return (totalMat + totalMO).toFixed(2);
  };

  const calcularTotalOrcamento = () => {
    let total = 0;
    locais.forEach(local => {
      local.etapas.forEach(etapa => {
        etapa.subEtapas.forEach(subEtapa => {
          subEtapa.servicos.forEach(servico => {
            const totalMat = servico.quantidade * servico.valorUnitarioMaterial * (1 + (servico.bdiMaterial || 40) / 100);
            const totalMO = servico.quantidade * servico.valorUnitarioMaoDeObra * (1 + (servico.bdiMaoDeObra || 80) / 100);
            total += totalMat + totalMO;
          });
        });
      });
    });
    return total.toFixed(2);
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
        locais
      };

      await axios.post('https://minhas-obras-backend.onrender.com/api/orcamentos', orcamento);
      carregarOrcamentos();
      setNomeOrcamento('');
      setObraSelecionada('');
      setLocais([
        {
          nome: '',
          etapas: [
            {
              nome: '',
              subEtapas: [
                {
                  nome: '',
                  servicos: [
                    {
                      descricao: '',
                      unidade: '',
                      quantidade: 1,
                      valorUnitarioMaterial: 0,
                      valorUnitarioMaoDeObra: 0,
                      bdiMaterial: 40,
                      bdiMaoDeObra: 80
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]);
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
                <h2>🧮 Novo Orçamento</h2>
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

                  {locais.map((local, idxLocal) => (
                    <div key={idxLocal} className="local" style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '15px' }}>
                      <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
                        <input
                          placeholder="Local (ex: Torre A)"
                          value={local.nome}
                          onChange={(e) => {
                            const novos = [...locais];
                            novos[idxLocal].nome = e.target.value;
                            setLocais(novos);
                          }}
                          required
                          style={{ width: '70%', padding: '6px' }}
                        />
                        <button type="button" onClick={() => adicionarEtapa(idxLocal)} style={{ marginLeft: '10px', padding: '5px 10px' }}>
                          + Etapa
                        </button>
                      </h3>

                      {local.etapas.map((etapa, idxEtapa) => (
                        <div key={idxEtapa} className="etapa" style={{ marginLeft: '20px', borderLeft: '2px solid #3498db', paddingLeft: '15px', paddingTop: '10px' }}>
                          <h4 style={{ margin: '0 0 10px 0', color: '#3498db' }}>
                            <input
                              placeholder="Etapa (ex: Fundações)"
                              value={etapa.nome}
                              onChange={(e) => {
                                const novos = [...locais];
                                novos[idxLocal].etapas[idxEtapa].nome = e.target.value;
                                setLocais(novos);
                              }}
                              required
                              style={{ width: '70%', padding: '6px' }}
                            />
                            <button type="button" onClick={() => adicionarSubEtapa(idxLocal, idxEtapa)} style={{ marginLeft: '10px', padding: '5px 10px' }}>
                              + Sub Etapa
                            </button>
                          </h4>

                          {etapa.subEtapas.map((subEtapa, idxSub) => (
                            <div key={idxSub} className="sub-etapa" style={{ marginLeft: '20px', borderLeft: '2px dashed #e67e22', paddingLeft: '15px', paddingTop: '10px' }}>
                              <h5 style={{ margin: '0 0 10px 0', color: '#e67e22' }}>
                                <input
                                  placeholder="Sub Etapa (ex: Armadura)"
                                  value={subEtapa.nome}
                                  onChange={(e) => {
                                    const novos = [...locais];
                                    novos[idxLocal].etapas[idxEtapa].subEtapas[idxSub].nome = e.target.value;
                                    setLocais(novos);
                                  }}
                                  required
                                  style={{ width: '70%', padding: '6px' }}
                                />
                                <button type="button" onClick={() => adicionarServico(idxLocal, idxEtapa, idxSub)} style={{ marginLeft: '10px', padding: '5px 10px' }}>
                                  + Serviço
                                </button>
                              </h5>

                              <table className="tabela-servicos" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                                <thead>
                                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                                    <th style={{ padding: '8px', textAlign: 'left', width: '80px' }}>Código</th>
                                    <th style={{ padding: '8px', textAlign: 'left' }}>Descrição</th>
                                    <th style={{ padding: '8px', width: '80px' }}>Unid.</th>
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
                                  {subEtapa.servicos.map((servico, idxServico) => (
                                    <tr key={idxServico}>
                                      <td style={{ padding: '6px' }}>{`${idxLocal+1}.${idxEtapa+1}.${idxSub+1}.${idxServico+1}`}</td>
                                      <td style={{ padding: '6px' }}><input type="text" value={servico.descricao} onChange={(e) => atualizarServico(idxLocal, idxEtapa, idxSub, idxServico, 'descricao', e.target.value)} style={{ width: '100%' }} /></td>
                                      <td style={{ padding: '6px' }}><input type="text" value={servico.unidade} onChange={(e) => atualizarServico(idxLocal, idxEtapa, idxSub, idxServico, 'unidade', e.target.value)} style={{ width: '100%' }} /></td>
                                      <td style={{ padding: '6px' }}><input type="number" value={servico.quantidade} onChange={(e) => atualizarServico(idxLocal, idxEtapa, idxSub, idxServico, 'quantidade', parseFloat(e.target.value) || 0)} style={{ width: '100%' }} /></td>
                                      <td style={{ padding: '6px' }}><input type="number" value={servico.valorUnitarioMaterial} onChange={(e) => atualizarServico(idxLocal, idxEtapa, idxSub, idxServico, 'valorUnitarioMaterial', parseFloat(e.target.value) || 0)} style={{ width: '100%' }} /></td>
                                      <td style={{ padding: '6px' }}><input type="number" value={servico.bdiMaterial} onChange={(e) => atualizarServico(idxLocal, idxEtapa, idxSub, idxServico, 'bdiMaterial', parseFloat(e.target.value) || 0)} style={{ width: '100%' }} />%</td>
                                      <td style={{ padding: '6px' }}><input type="number" value={servico.valorUnitarioMaoDeObra} onChange={(e) => atualizarServico(idxLocal, idxEtapa, idxSub, idxServico, 'valorUnitarioMaoDeObra', parseFloat(e.target.value) || 0)} style={{ width: '100%' }} /></td>
                                      <td style={{ padding: '6px' }}><input type="number" value={servico.bdiMaoDeObra} onChange={(e) => atualizarServico(idxLocal, idxEtapa, idxSub, idxServico, 'bdiMaoDeObra', parseFloat(e.target.value) || 0)} style={{ width: '100%' }} />%</td>
                                      <td style={{ padding: '6px', fontWeight: 'bold' }}>{calcularTotalItem(servico)}</td>
                                      <td style={{ padding: '6px' }}>
                                        <button type="button" onClick={() => removerServico(idxLocal, idxEtapa, idxSub, idxServico)} style={{ background: '#e53e3e', color: 'white', border: 'none', padding: '4px 6px', cursor: 'pointer' }}>
                                          X
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}

                  <button type="button" onClick={adicionarLocal} style={{ marginBottom: '15px' }}>+ Adicionar Local</button>

                  <div style={{ marginTop: '15px', fontWeight: 'bold', fontSize: '1.1em', color: '#2c3e50' }}>
                    Total do Orçamento: R$ {calcularTotalOrcamento()}
                  </div>

                  <button type="submit" style={{ marginTop: '15px', padding: '10px 20px', backgroundColor: '#27ae60', color: 'white', border: 'none', cursor: 'pointer' }}>
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
