import React from 'react';

function Login({ onLogin, email, setEmail, password, setPassword }) {
  return (
    <div className="login-wrapper animate-fade-in">
      <div className="pinterest-card">
        <div className="login-header">
          {/* Removido o título h1 azul para evitar bagunça visual */}
          <h2 className="login-welcome">Bem-vindo(a) ao Focus</h2>
          <p className="login-subtitle">Organize suas ideias e tarefas</p>
        </div>

        <form onSubmit={onLogin} className="login-form">
          <div className="mb-3 text-start">
            <input 
              type="email" 
              className="form-control-pinterest" 
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3 text-start">
            <input 
              type="password" 
              className="form-control-pinterest" 
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-pinterest">Continuar</button>
        </form>

        <div className="login-footer">
          <p className="terms">
            Ao continuar, você concorda com os <strong>Termos de Serviço</strong> do Focus.
          </p>
          <hr />
          <p className="signup-text">
            Ainda não está no Focus? <strong>Cadastre-se</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;