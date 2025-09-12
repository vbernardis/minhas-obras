import React, { useState, useEffect } from 'react';
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

  // Estados para usuarios
  const [usuarios, setUsuarios] = useState([]);

  // Estado para orcamentos
  const [orcamentos, setOrcamentos] = useState([]);
  const [obraSelecionada, setObraSelecionada] = useState('');
  const [nomeOrcamento, setNomeOrcamento] = useState('');
  const [itens, setItens] = useState([
    { id: 1, nivel: 'local', codigo: '01', descricao: '', unidade: '', quantidade: 0, valorUnitarioMaterial: 0, valorUnitarioMaoDeObra: 0 }
  ]);
  const [bdiMaterialGlobal, setBdiMaterialGlobal] = useState(40);
  const [bdiMaoDeObraGlobal, setBdiMaoDeObraGlobal] = useState(80);
  const [admObras, setAdmObras] = useState(15);

  const proximoId = () => Math.max(...itens.map(i => i.id), 0) + 1;

  const [abaAtiva, setAbaAtiva] = useState('dashboard');

  // ✅ URL CORRIGIDA: sem espaços no final
  const BASE_URL = 'https://minhas-obras-backend.onrender.com';

  useEffect(() => {
    if (tela === 'sistema') {
      carregarObras();
      carregarUsuarios();
      carregarOrcamentos();
    }
  }, [tela]);

  const carregarObras = async () => {
    try {
      const resposta = await fetch(`${BASE_URL}/api/obras`);
      if (resposta.ok) {
        const dados = await resposta.json();
        setObras(dados);
      }
    } catch (erro) {
      console.error('Erro ao carregar obras:', erro);
    }
  };

  const carregarUsuarios = async () => {
    try {
      const resposta = await fetch(`${BASE_URL}/api/usuarios`);
      if (resposta.ok) {
        const dados = await resposta.json();
        setUsuarios(dados);
      }
    } catch (erro) {
      console.error('Erro ao carregar usuarios:', erro);
    }
  };

  const carregarOrcamentos = async () => {
    try {
      const resposta = await fetch(`${BASE_URL}/api/orcamentos`);
      if (resposta.ok) {
        const dados = await resposta.json();
        setOrcamentos(dados);
      }
    } catch (erro) {
      console.error('Erro ao carregar orcamentos:', erro);
    }
  };

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
      const resposta = await fetch(`${BASE_URL}/api/obras`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaObra)
      });
      if (resposta.ok) {
        carregarObras();
        setNomeObra('');
        setEnderecoObra('');
        setProprietarioObra('');
        setResponsavelObra('');
        setStatusObra('planejamento');
      }
    } catch (erro) {
      alert('Erro ao cadastrar obra');
    }
  };

  const cadastrar = async (e) => {
    e.preventDefault();
    setMensagem('');
    try {
      const resposta = await fetch(`${BASE_URL}/api/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha })
      });
      if (resposta.ok) {
        const usuario = await resposta.json();
        setMensagem(`Usuario ${usuario.nome} cadastrado com sucesso!`);
        setNome('');
        setEmail('');
        setSenha('');
        carregarUsuarios();
      } else {
        setMensagem('Erro ao cadastrar usuario');
      }
    } catch (erro) {
      setMensagem('Erro de conexao');
    }
  };

  const logar = async (e) => {
    e.preventDefault();
    setMensagem('');
    try {
      const resposta = await fetch(`${BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });
      if (resposta.ok) {
        const usuario = await resposta.json();
        setUsuarioLogado(usuario);
        setTela('sistema');
        setEmail('');
        setSenha('');
      } else {
        setMensagem('Credenciais invalidas');
      }
    } catch (erro) {
      setMensagem('Erro de conexao');
    }
  };

  const sair = () => {
    setUsuarioLogado(null);
    setTela('login');
  };

  const adicionarItem = (nivel) => {
    const id = proximoId();
    let codigo = '';
    switch (nivel) {
      case 'local':
        const locais = itens.filter(i => i.nivel === 'local').map(i => parseInt(i.codigo) || 0);
        codigo = `${Math.max(...locais, 0) + 1}`;
        break;
      case 'etapa':
        codigo = '01.01';
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

    setItens([...itens, {
      id,
      nivel,
      codigo,
      descricao: '',
      unidade: '',
      quantidade: 1,
      valorUnitarioMaterial: 0,
      valorUnitarioMaoDeObra: 0
    }]);
  };

  const removerItem = (id) => {
    setItens(itens.filter(item => item.id !== id));
  };

  const atualizarItem = (id, campo, valor) => {
    setItens(itens.map(item => item.id === id ? { ...item, [campo]: valor } : item));
  };

  const calcularTotalItem = (item) => {
    if (item.nivel !== 'servico') return 0;
    const totalMat = item.quantidade * item.valorUnitarioMaterial * (1 + bdiMaterialGlobal / 100);
    const totalMO = item.quantidade * item.valorUnitarioMaoDeObra * (1 + bdiMaoDeObraGlobal / 100);
    return totalMat + totalMO;
  };

  const calcularHierarquia = () => {
    const resultado = [...itens].sort((a, b) => a.id - b.id);
    const map = new Map(resultado.map(item => [item.id, { ...item, total: 0 }]));

    for (let item of resultado) {
      if (item.nivel === 'servico') {
        const total = calcularTotalItem(item);
        map.get(item.id).total = total;
      }
    }

    for (let item of resultado) {
      if (item.nivel === 'local' || item.nivel === 'etapa' || item.nivel === 'subEtapa') {
        let soma = 0;
        let found = false;
        for (let seguido of resultado) {
          if (seguido.id === item.id) found = true;
          else if (found) {
            if (seguido.nivel === 'local' && item.nivel === 'local') break;
            if (seguido.nivel === 'etapa' && item.nivel === 'local') continue;
            if ((seguido.nivel === 'subEtapa' || seguido.nivel === 'etapa') && item.nivel === 'local') continue;
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
      alert('Selecione uma obra.');
      return;
    }

    const orcamentoFormatado = {
      obraId: parseInt(obraSelecionada),
      nome: nomeOrcamento,
      bdiMaterialGlobal,
      bdiMaoDeObraGlobal,
      admObras,
      locais: []
    };

    let localAtual = null;
    let etapaAtual = null;
    let subEtapaAtual = null;

    for (const item of itensComTotais) {
      if (item.nivel === 'local') {
        localAtual = { descricao: item.descricao, etapas: [] };
        orcamentoFormatado.locais.push(localAtual);
      } else if (item.nivel === 'etapa' && localAtual) {
        etapaAtual = { descricao: item.descricao, subEtapas: [] };
        localAtual.etapas.push(etapaAtual);
      } else if (item.nivel === 'subEtapa' && etapaAtual) {
        subEtapaAtual = { descricao: item.descricao, servicos: [] };
        etapaAtual.subEtapas.push(subEtapaAtual);
      } else if (item.nivel === 'servico' && subEtapaAtual) {
        const totalMat = item.quantidade * item.valorUnitarioMaterial * (1 + bdiMaterialGlobal / 100);
        const totalMO = item.quantidade * item.valorUnitarioMaoDeObra * (1 + bdiMaoDeObraGlobal / 100);
        subEtapaAtual.servicos.push({
          descricao: item.descricao,
          unidade: item.unidade,
          quantidade: item.quantidade,
          valorUnitarioMaterial: item.valorUnitarioMaterial,
          valorUnitarioMaoDeObra: item.valorUnitarioMaoDeObra,
          bdiMaterial: bdiMaterialGlobal,
          bdiMaoDeObra: bdiMaoDeObraGlobal,
          valorTotal: totalMat + totalMO
        });
      }
    }

    try {
      const resposta = await fetch(`${BASE_URL}/api/orcamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orcamentoFormatado)
      });
      if (resposta.ok) {
        alert('Orcamento salvo com sucesso!');
        setNomeOrcamento('');
        setObraSelecionada('');
        setItens([{ id: 1, nivel: 'local', codigo: '01', descricao: '', unidade: '', quantidade: 0, valorUnitarioMaterial: 0, valorUnitarioMaoDeObra: 0 }]);
        setBdiMaterialGlobal(40);
        setBdiMaoDeObraGlobal(80);
        setAdmObras(15);
        carregarOrcamentos();
      } else {
        alert('Erro ao salvar orcamento');
      }
    } catch (erro) {
      console.error('Erro ao salvar orcamento:', erro);
      alert('Erro de conexao');
    }
  };

  return (
    <div className="App">
      {/* TELA DE LOGIN */}
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

      {/* TELA DE CADASTRO */}
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

      {/* TELA DO SISTEMA */}
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
            <button onClick={() => { setAbaAtiva('usuarios'); carregarUsuarios(); }}>Usuarios</button>
            <button onClick={() => { setAbaAtiva('orcamentos'); carregarOrcamentos(); }}>Orcamentos</button>
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
                      placeholder="Endereco"
                      value={enderecoObra}
                      onChange={(e) => setEnderecoObra(e.target.value)}
                      required
                    />
                    <input
                      placeholder="Proprietario (opcional)"
                      value={proprietarioObra}
                      onChange={(e) => setProprietarioObra(e.target.value)}
                    />
                    <input
                      placeholder="Responsavel (opcional)"
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
                      <option value="concluida">Concluida</option>
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
                            {obra.status === 'concluida' && 'Concluida'}
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
                <h2>👥 Usuarios Cadastrados ({usuarios.length})</h2>
                {usuarios.length === 0 ? (
                  <p>Nenhum usuario encontrado.</p>
                ) : (
                  <table className="tabela-usuarios">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map(usuario => (
                        <tr key={usuario.id}>
                          <td>{usuario.nome}</td>
                          <td>{usuario.email}</td>
                          <td>
                            <span className="badge tipo-usuario">Ativo</span>
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
                <h2>🧮 Orcamento - Planilha</h2>
                <form onSubmit={cadastrarOrcamento}>
                  <div style={{ marginBottom: '15px' }}>
                    <label>Obra:</label>
                    <select
                      value={obraSelecionada}
                      onChange={(e) => setObraSelecionada(e.target.value)}
                      required
                      style={{ width: '100%', padding: '6px', marginTop: '5px' }}
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
                    placeholder="Nome do orcamento"
                    value={nomeOrcamento}
                    onChange={(e) => setNomeOrcamento(e.target.value)}
                    required
                    style={{ width: '100%', padding: '6px', marginBottom: '10px' }}
                  />

                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => adicionarItem('local')} style={{ padding: '6px 12px', fontSize: '14px' }}>+ Local</button>
                    <button type="button" onClick={() => adicionarItem('etapa')} style={{ padding: '6px 12px', fontSize: '14px' }}>+ Etapa</button>
                    <button type="button" onClick={() => adicionarItem('subEtapa')} style={{ padding: '6px 12px', fontSize: '14px' }}>+ Sub Etapa</button>
                    <button type="button" onClick={() => adicionarItem('servico')} style={{ padding: '6px 12px', fontSize: '14px' }}>+ Servico</button>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '14px' }}>
                      <label>BDI Mat. (%): </label>
                      <input
                        type="number"
                        value={bdiMaterialGlobal}
                        onChange={(e) => setBdiMaterialGlobal(parseFloat(e.target.value) || 0)}
                        style={{ width: '70px', padding: '4px' }}
                      />%
                    </div>
                    <div style={{ fontSize: '14px' }}>
                      <label>BDI MO (%): </label>
                      <input
                        type="number"
                        value={bdiMaoDeObraGlobal}
                        onChange={(e) => setBdiMaoDeObraGlobal(parseFloat(e.target.value) || 0)}
                        style={{ width: '70px', padding: '4px' }}
                      />%
                    </div>
                  </div>

                  <div style={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '6px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f1f1f1', fontWeight: 'bold' }}>
                          <th style={{ padding: '6px', width: '90px' }}>Codigo</th>
                          <th style={{ padding: '6px' }}>Descricao</th>
                          <th style={{ padding: '6px', width: '70px' }}>Unidade</th>
                          <th style={{ padding: '6px', width: '80px' }}>Quantidade</th>
                          <th style={{ padding: '6px', width: '110px' }}>Valor Unit. Material</th>
                          <th style={{ padding: '6px', width: '110px' }}>Valor Unit. Mão de Obra</th>
                          <th style={{ padding: '6px', width: '110px' }}>Preço Total</th>
                          <th style={{ padding: '6px', width: '50px' }}>Ação</th>
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
                            <td style={{ padding: '4px' }}>
                              <input
                                type="text"
                                value={item.codigo}
                                onChange={(e) => atualizarItem(item.id, 'codigo', e.target.value)}
                                style={{ width: '100%', padding: '4px', fontSize: '12px' }}
                                readOnly={item.nivel !== 'servico'}
                              />
                            </td>
                            <td style={{ padding: '4px' }}>
                              <input
                                type="text"
                                value={item.descricao}
                                onChange={(e) => atualizarItem(item.id, 'descricao', e.target.value)}
                                style={{ width: '100%', padding: '4px', fontSize: '12px' }}
                              />
                            </td>
                            {item.nivel === 'servico' ? (
                              <>
                                <td style={{ padding: '4px' }}>
                                  <input
                                    type="text"
                                    value={item.unidade}
                                    onChange={(e) => atualizarItem(item.id, 'unidade', e.target.value)}
                                    style={{ width: '100%', padding: '4px', fontSize: '12px' }}
                                  />
                                </td>
                                <td style={{ padding: '4px' }}>
                                  <input
                                    type="number"
                                    value={item.quantidade}
                                    onChange={(e) => atualizarItem(item.id, 'quantidade', parseFloat(e.target.value) || 0)}
                                    style={{ width: '100%', padding: '4px', fontSize: '12px' }}
                                  />
                                </td>
                                <td style={{ padding: '4px' }}>
                                  <input
                                    type="number"
                                    value={item.valorUnitarioMaterial}
                                    onChange={(e) => atualizarItem(item.id, 'valorUnitarioMaterial', parseFloat(e.target.value) || 0)}
                                    style={{ width: '100%', padding: '4px', fontSize: '12px' }}
                                  />
                                </td>
                                <td style={{ padding: '4px' }}>
                                  <input
                                    type="number"
                                    value={item.valorUnitarioMaoDeObra}
                                    onChange={(e) => atualizarItem(item.id, 'valorUnitarioMaoDeObra', parseFloat(e.target.value) || 0)}
                                    style={{ width: '100%', padding: '4px', fontSize: '12px' }}
                                  />
                                </td>
                                <td style={{ padding: '4px', fontWeight: 'bold', color: '#27ae60' }}>
                                  R$ {calcularTotalItem(item).toFixed(2)}
                                </td>
                              </>
                            ) : (
                              <td colSpan={5} style={{ textAlign: 'right', fontWeight: 'bold', color: '#2c3e50', padding: '4px' }}>
                                Total: R$ {item.total.toFixed(2)}
                              </td>
                            )}
                            <td style={{ padding: '4px' }}>
                              <button
                                type="button"
                                onClick={() => removerItem(item.id)}
                                style={{ background: '#e53e3e', color: 'white', border: 'none', padding: '2px 4px', fontSize: '12px', cursor: 'pointer' }}
                              >
                                X
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ fontSize: '14px' }}>
                      <label>ADM de Obras (%): </label>
                      <input
                        type="number"
                        value={admObras}
                        onChange={(e) => setAdmObras(parseFloat(e.target.value) || 0)}
                        style={{ width: '70px', padding: '4px' }}
                      />%
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '14px' }}>
                      <div>Subtotal: R$ {calcularSubtotal().toFixed(2)}</div>
                      <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                        Total Final: R$ {calcularTotalFinal().toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    style={{
                      marginTop: '15px',
                      padding: '10px 20px',
                      backgroundColor: '#27ae60',
                      color: 'white',
                      border: 'none',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      cursor: 'pointer'
                    }}
                  >
                    Cadastrar Orcamento
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
