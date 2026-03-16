import { useState, useEffect } from 'react'
import { Capacitor } from '@capacitor/core' // Adicionado para detectar o celular
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // LÓGICA INTELIGENTE: Pular login se estiver no celular
  useEffect(() => {
    const isNative = Capacitor.isNativePlatform();
    if (isNative) {
      setIsLoggedIn(true);
    }
  }, []);

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('focus_tasks');
    if (savedTasks) {
      return JSON.parse(savedTasks).map(t => ({
        ...t,
        end: t.end ? new Date(t.end) : null
      }));
    }
    return [];
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('focus_theme');
    return savedTheme === 'true';
  });

  const [taskInput, setTaskInput] = useState('');
  const [taskStart, setTaskStart] = useState('');
  const [taskEnd, setTaskEnd] = useState('');
  const [noDeadline, setNoDeadline] = useState(false);
  const [taskEffort, setTaskEffort] = useState('Média 💪');
  const [taskRepeat, setTaskRepeat] = useState('Não');
  const [taskTag, setTaskTag] = useState('Trabalho');
  const [filter, setFilter] = useState('todas');
  const [progress, setProgress] = useState(0);
  const [taskHourInterval, setTaskHourInterval] = useState('00:00');

  useEffect(() => {
    localStorage.setItem('focus_tasks', JSON.stringify(tasks));
    if (tasks.length === 0) {
      setProgress(0);
    } else {
      const doneTasks = tasks.filter(t => t.done).length;
      setProgress((doneTasks / tasks.length) * 100);
    }
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('focus_theme', isDarkMode);
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (email && password) {
      setIsLoggedIn(true);
    } else {
      alert("Preencha os campos! 🔑");
    }
  };

  const handleFocusEscape = (e) => {
    const target = e.currentTarget;
    const padding = 100;
    const newX = Math.random() * (window.innerWidth - padding * 2) + padding;
    const newY = Math.random() * (window.innerHeight - padding * 2) + padding;
    
    target.style.position = 'fixed';
    target.style.left = `${newX}px`;
    target.style.top = `${newY}px`;
    target.style.zIndex = '3000';
    target.style.transform = 'translate(-50%, -50%)';
  };

  const resetFocus = () => {
    const title = document.querySelector('.app-title');
    if (title) {
      title.style.position = 'relative';
      title.style.left = '0';
      title.style.top = '0';
      title.style.transform = 'none';
    }
  };

  const addTask = () => {
    if (!taskInput.trim() || !taskStart || (!noDeadline && !taskEnd)) {
      alert("Preencha os campos obrigatórios! 🧠");
      return;
    }
    const newTask = {
      id: Date.now(),
      text: taskInput,
      start: taskStart,
      end: noDeadline ? null : new Date(taskEnd),
      effort: taskEffort,
      repeat: taskRepeat,
      hourInterval: taskRepeat === 'Hora' ? taskHourInterval : null,
      tag: taskTag,
      done: false
    };
    setTasks([...tasks, newTask]);
    setTaskInput(''); setTaskEnd(''); setTaskHourInterval('00:00'); setNoDeadline(false);
  };

  const toggleDone = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const removeTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="container-principal">
      <button className="btn-theme-toggle-cat" onClick={() => setIsDarkMode(!isDarkMode)}>
        <img src={isDarkMode ? "cat-open.png" : "cat-shy.png"} alt="Tema" className="cat-theme-icon" />
      </button>

      {!isLoggedIn ? (
        <div className="login-wrapper animate-fade-in">
          <div className="pinterest-card">
            <h2 className="login-welcome">Bem-vindo ao Focus</h2>
            <p className="login-subtitle">Organize sua rotina agora</p>
            <form onSubmit={handleLogin}>
              <input type="email" className="form-control mb-3" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" className="form-control mb-3" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="submit" className="btn-pinterest">Log in</button>
            </form>
          </div>
        </div>
      ) : (
        <>
          <div className="card welcome-card">
            <img src={isDarkMode ? "img2.png" : "img1.png"} className="card-img-top" alt="Banner" />
          </div>

          <div className="input-section">
            <div className="title-container">
              <div className="focus-reset-area" onClick={resetFocus}></div>
              <h1 className="app-title" onMouseEnter={handleFocusEscape}>Focus</h1>
            </div>

            <div className="progress mb-4" style={{ width: '100%', maxWidth: '500px', height: '10px', borderRadius: '10px' }}>
              <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: `${progress}%`, backgroundColor: '#00acc1' }}></div>
            </div>

            <div className="filtros-container mb-4">
              {['todas', 'Trabalho', 'Estudo', 'Pessoal'].map((cat) => (
                <div key={cat} className={`card-filtro ${filter === cat ? 'active' : ''}`} onClick={() => setFilter(cat)}>
                  <span>{cat === 'todas' ? 'Todas' : cat === 'Trabalho' ? 'Trabalho' : cat === 'Pessoal' ? 'Vida' : cat}</span>
                </div>
              ))}
            </div>

            <div className="planner-card card p-4 mb-4">
              <input className="form-control mb-3" placeholder="O que vamos focar agora?" value={taskInput} onChange={(e) => setTaskInput(e.target.value)} />
              
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="small label-custom">📅 Início</label>
                  <input type="datetime-local" className="form-control" value={taskStart} onChange={(e) => setTaskStart(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="small label-custom d-flex justify-content-between align-items-center">
                    🏁 Término
                    <span style={{ fontSize: '0.65rem', cursor: 'pointer' }}>
                      <input type="checkbox" className="me-1" checked={noDeadline} onChange={(e) => setNoDeadline(e.target.checked)} /> Indet.
                    </span>
                  </label>
                  <input type="datetime-local" className="form-control" value={taskEnd} disabled={noDeadline} onChange={(e) => setTaskEnd(e.target.value)} />
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-4">
                  <label className="small label-custom">🧠 Energia</label>
                  <select className="form-select" value={taskEffort} onChange={(e) => setTaskEffort(e.target.value)}>
                    <option value="Baixa ☕">Baixa</option>
                    <option value="Média 💪">Média</option>
                    <option value="Alta 🔥">Alta</option>
                  </select>
                </div>
                <div className="col-4">
                  <label className="small label-custom">🔄 Repetir</label>
                  <select className="form-select" value={taskRepeat} onChange={(e) => setTaskRepeat(e.target.value)}>
                    <option value="Não">Não</option>
                    <option value="Hora">Hora</option>
                    <option value="Diário">Diário</option>
                    <option value="Semanal">Semanal</option>
                    <option value="Mensal">Mensal</option>
                    <option value="Anual">Anual</option>
                  </select>
                </div>
                <div className="col-4">
                  <label className="small label-custom">🏷️ Tag</label>
                  <select className="form-select" value={taskTag} onChange={(e) => setTaskTag(e.target.value)}>
                    <option value="Trabalho">Trabalho</option>
                    <option value="Estudo">Estudo</option>
                    <option value="Pessoal">Vida</option>
                  </select>
                </div>
              </div>

              {taskRepeat === 'Hora' && (
                <div className="mb-3 animate-fade-in">
                  <label className="small label-custom">⏰ Intervalo (Horas : Minutos)</label>
                  <div className="d-flex gap-2">
                    <select 
                      className="form-select select-scroll"
                      value={taskHourInterval.split(':')[0] || '00'}
                      onChange={(e) => {
                        const mins = taskHourInterval.split(':')[1] || '00';
                        setTaskHourInterval(`${e.target.value}:${mins}`);
                      }}
                    >
                      {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).map(h => (
                        <option key={h} value={h}>{h} h</option>
                      ))}
                    </select>
                    <select 
                      className="form-select select-scroll"
                      value={taskHourInterval.split(':')[1] || '00'}
                      onChange={(e) => {
                        const hrs = taskHourInterval.split(':')[0] || '00';
                        setTaskHourInterval(`${hrs}:${e.target.value}`);
                      }}
                    >
                      {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map(m => (
                        <option key={m} value={m}>{m} m</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <button onClick={addTask} className="btn btn-primary w-100 fw-bold">ADICIONAR</button>
            </div>

            <ul id="taskList">
              {tasks.filter(t => filter === 'todas' || t.tag === filter).map(t => (
                <li key={t.id} className={t.done ? 'done' : ''} onClick={() => toggleDone(t.id)}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <span className="badge" style={{ backgroundColor: t.tag === 'Trabalho' ? '#00acc1' : t.tag === 'Estudo' ? '#4db6ac' : '#9575cd', fontSize: '0.6rem' }}>{t.tag}</span>
                      <small className="ms-2 opacity-75">{t.effort}</small>
                      <h5 className="mt-2 mb-0"><strong>{t.text}</strong></h5>
                    </div>
                    <button className="btn btn-sm text-danger" onClick={(e) => { e.stopPropagation(); removeTask(t.id); }}>🗑️</button>
                  </div>
                </li>
              ))}
            </ul>
            
            {/* Opcional: Ocultar o botão "Sair" se estiver no celular para evitar que o usuário volte para a tela de login vazia */}
            {!Capacitor.isNativePlatform() && (
              <button className="btn btn-sm btn-outline-secondary mt-4 mb-5" onClick={() => setIsLoggedIn(false)} style={{ borderRadius: '20px', fontSize: '0.7rem' }}>Sair da conta</button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default App