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

  // Carregar obras ao entrar no sistema
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
      const novaObra = { nome: nomeObra, endereco: enderecoObra, proprietario: proprietarioObra, responsavel: responsavelObra, status: statusObra };
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
    setLocais([...locais, { nome: '', etapas: [] }]);
  };

  const adicionarEtapa = (index) => {
    const novos = [...locais];
    novos[index].etapas.push({ nome: '', subEtapas: [] });
    setLocais(novos);
  };

  const adicionarSubEtapa = (idxLocal, idxEtapa) => {
    const novos = [...locais];
    novos[idxLocal].etapas[idxEtapa].subEtapas.push({ nome: '', servicos: [] });
    setLocais(novos);
  };

  const adicionarServico = (idxLocal, idxEtapa, idxSub) => {
    const novos = [...locais];
    novos[idxLocal].etapas[idxEtapa].subEtapas[idxSub].servicos.push({
      descricao: '', unidade: '', quantidade: 1,
      valorUnitarioMaterial: 0, valorUnitarioMaoDeObra: 0,
      bdiMaterial: 40, bdiMaoDeObra: 80
    });
    setLocais(novos);
  };

  const cadastrarOrcamento = async (e) => {
    e.preventDefault();
    const obraId = obras[0]?.id || 1;

    try {
      const orcamento = { obraId, nome: nomeOrcamento, locais };
      await axios.post('https://minhas-obras-backend.onrender.com/api/orcamentos', orcamento);
      carregarOrcamentos();
      setNomeOrcamento('');
      setLocais([{ nome: '', etapas: [{ nome: '', subEtapas: [{ nome: '', servicos: [{ descricao: '', unidade: '', quantidade: 1, valorUnitarioMaterial: 0, valorUnitarioMaoDeObra: 0, bdiMaterial: 40, bdiMaoDeObra: 80 }] }] }] });
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
            <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input placeholder="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
            <button type="submit">Entrar</button>
          </form>
          <p><button onClick={() => setTela('cadastro')} className="link">Criar uma conta</button></p>
          {mensagem && <p className="mensagem">{mensagem}</p>}
        </div>
      )}

      {/* Tela de Cadastro */}
      {tela === 'cadastro' && (
        <div className="tela-cadastro">
          <h1>Minhas Obras</h1>
          <h2>📝 Criar Conta</h2>
          <form onSubmit={cadastrar}>
            <input placeholder="Nome completo" type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
            <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input placeholder="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
            <button type="submit">Cadastrar</button>
          </form>
          <p><button onClick={() => setTela('login')} className="link">Já tem conta? Entrar</button></p>
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
              <div><h2>📊 Dashboard</h2><p>Bem-vindo ao painel principal, {usuarioLogado?.nome}!</p></div>
            )}

            {abaAtiva === 'obras' && (
              <div>
                <h2>🏗️ Obras</h2>
                <div className="card">
                  <h3>Cadastrar Nova Obra</h3>
                  <form onSubmit={cadastrarObra}>
                    <input placeholder="Nome da obra" value={nomeObra} onChange={(e) => setNomeObra(e.target.value)} required />
                    <input placeholder="Endereço" value={enderecoObra} onChange={(e) => setEnderecoObra(e.target.value)} required />
                    <input placeholder="Proprietário (opcional)" value={proprietarioObra} onChange={(e) => setProprietarioObra(e.target.value)} />
                    <input placeholder="Responsável (opcional)" value={responsavelObra} onChange={(e) => setResponsavelObra(e.target.value)} />
                    <select value={statusObra} onChange={(e) => setStatusObra(e.target.value)}>
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
                  <input
                    placeholder="Nome do orçamento"
                    value={nomeOrcamento}
                    onChange={(e) => setNomeOrcamento(e.target.value)}
                    required
                  />

                  {locais.map((local, idxLocal) => (
                    <div key={idxLocal} className="local">
                      <h3>
                        <input
                          placeholder="Local (ex: Torre A)"
                          value={local.nome}
                          onChange={(e) => {
                            const novos = [...locais];
                            novos[idxLocal].nome = e.target.value;
                            setLocais(novos);
                          }}
                          required
                        />
                        <button type="button" onClick={() => adicionarEtapa(idxLocal)}>+ Etapa</button>
                      </h3>

                      {local.etapas.map((etapa, idxEtapa) => (
                        <div key={idxEtapa} className="etapa">
                          <h4>
                            <input
                              placeholder="Etapa (ex: Fundações)"
                              value={etapa.nome}
                              onChange={(e) => {
                                const novos = [...locais];
                                novos[idxLocal].etapas[idxEtapa].nome = e.target.value;
                                setLocais(novos);
                              }}
                              required
                            />
                            <button type="button" onClick={() => adicionarSubEtapa(idxLocal, idxEtapa)}>+ Sub Etapa</button>
                          </h4>

                          {etapa.subEtapas.map((subEtapa, idxSub) => (
                            <div key={idxSub} className="sub-etapa">
                              <h5>
                                <input
                                  placeholder="Sub Etapa (ex: Armadura)"
                                  value={subEtapa.nome}
                                  onChange={(e) => {
                                    const novos = [...locais];
                                    novos[idxLocal].etapas[idxEtapa].subEtapas[idxSub].nome = e.target.value;
                                    setLocais(novos);
                                  }}
                                  required
                                />
                                <button type="button" onClick={() => adicionarServico(idxLocal, idxEtapa, idxSub)}>+ Serviço</button>
                              </h5>

                              <table className="tabela-servicos">
                                <thead>
                                  <tr>
                                    <th>Código</th>
                                    <th>Descrição</th>
                                    <th>Unidade</th>
                                    <th>Quantidade</th>
                                    <th>Valor Mat. (unit)</th>
                                    <th>BDI Mat.</th>
                                    <th>Valor MO (unit)</th>
                                    <th>BDI MO</th>
                                    <th>Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {subEtapa.servicos.map((servico, idxServico) => {
                                    const total = (
                                      servico.quantidade * servico.valorUnitarioMaterial * (1 + (servico.bdiMaterial || 40) / 100) +
                                      servico.quantidade * servico.valorUnitarioMaoDeObra * (1 + (servico.bdiMaoDeObra || 80) / 100)
                                    ).toFixed(2);

                                    return (
                                      <tr key={idxServico}>
                                        <td>{`${idxLocal+1}.${idxEtapa+1}.${idxSub+1}.${idxServico+1}`}</td>
                                        <td><input type="text" value={servico.descricao} onChange={(e) => {
                                          const novos = [...locais];
                                          novos[idxLocal].etapas[idxEtapa].subEtapas[idxSub].servicos[idxServico].descricao = e.target.value;
                                          setLocais(novos);
                                        }} /></td>
                                        <td><input type="text" value={servico.unidade} onChange={(e) => {
                                          const novos = [...locais];
                                          novos[idxLocal].etapas[idxEtapa].subEtapas[idxSub].servicos[idxServico].unidade = e.target.value;
                                          setLocais(novos);
                                        }} /></td>
                                        <td><input type="number" value={servico.quantidade} onChange={(e) => {
                                          const novos = [...locais];
                                          novos[idxLocal].etapas[idxEtapa].subEtapas[idxSub].servicos[idxServico].quantidade = parseFloat(e.target.value) || 0;
                                          setLocais(novos);
                                        }} /></td>
                                        <td><input type="number" value={servico.valorUnitarioMaterial} onChange={(e) => {
                                          const novos = [...locais];
                                          novos[idxLocal].etapas[idxEtapa].subEtapas[idxSub].servicos[idxServico].valorUnitarioMaterial = parseFloat(e.target.value) || 0;
                                          setLocais(novos);
                                        }} /></td>
                                        <td><input type="number" value={servico.bdiMaterial} onChange={(e) => {
                                          const novos = [...locais];
                                          novos[idxLocal].etapas[idxEtapa].subEtapas[idxSub].servicos[idxServico].bdiMaterial = parseFloat(e.target.value) || 0;
                                          setLocais(novos);
                                        }} />%</td>
                                        <td><input type="number" value={servico.valorUnitarioMaoDeObra} onChange={(e) => {
                                          const novos = [...locais];
                                          novos[idxLocal].etapas[idxEtapa].subEtapas[idxSub].servicos[idxServico].valorUnitarioMaoDeObra = parseFloat(e.target.value) || 0;
                                          setLocais(novos);
                                        }} /></td>
                                        <td><input type="number" value={servico.bdiMaoDeObra} onChange={(e) => {
                                          const novos = [...locais];
                                          novos[idxLocal].etapas[idxEtapa].subEtapas[idxSub].servicos[idxServico].bdiMaoDeObra = parseFloat(e.target.value) || 0;
                                          setLocais(novos);
                                        }} />%</td>
                                        <td>{total}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}

                  <button type="button" onClick={adicionarLocal}>+ Adicionar Local</button>
                  <button type="submit">Cadastrar Orçamento</button>
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
