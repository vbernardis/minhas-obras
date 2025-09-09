import { useState } from 'react';
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

    // Estado para usuários
  const [usuarios, setUsuarios] = useState([]);

    // Estado para controlar qual aba está ativa
  const [abaAtiva, setAbaAtiva] = useState('dashboard');

    // Função para carregar usuários do servidor
  const carregarUsuarios = async () => {
    try {
      const resposta = await axios.get('http://localhost:3001/api/usuarios');
      setUsuarios(resposta.data);
    } catch (erro) {
      console.error('Erro ao carregar usuários');
    }
  };

  // Função para carregar obras do servidor
  const carregarObras = async () => {
    try {
      const resposta = await axios.get('http://localhost:3001/api/obras');
      setObras(resposta.data);
    } catch (erro) {
      console.error('Erro ao carregar obras');
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

      await axios.post('http://localhost:3001/api/obras', novaObra);
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

  // Carregar obras ao entrar no sistema
  if (tela === 'sistema' && obras.length === 0) {
    carregarObras();
  }

  // Função de cadastro
  const cadastrar = async (e) => {
    e.preventDefault();
    setMensagem('');
    try {
      const resposta = await axios.post('http://localhost:3001/api/usuarios', { nome, email, senha });
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
      const resposta = await axios.post('http://localhost:3001/api/login', { email, senha });
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
            <button>Dashboard</button>
            <button>Obras</button>
            <button>Usuários</button>
            <button>Orçamentos</button>
          </nav>

          <main>
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
          </main>
        </div>
      )}
    </div>
  );
}

export default App;