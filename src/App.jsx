import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // 1. CARREGAR DADOS AO INICIAR
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

  // NOVO ESTADO PARA O INTERVALO DE HORAS
  const [taskHourInterval, setTaskHourInterval] = useState('');

  // 2. SALVAR AUTOMATICAMENTE (Tarefas e Progresso)
  useEffect(() => {
    localStorage.setItem('focus_tasks', JSON.stringify(tasks));
    
    if (tasks.length === 0) {
      setProgress(0);
    } else {
      const doneTasks = tasks.filter(t => t.done).length;
      setProgress((doneTasks / tasks.length) * 100);
    }
  }, [tasks]);

  // 3. SALVAR TEMA
  useEffect(() => {
    localStorage.setItem('focus_theme', isDarkMode);
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  // FUNÇÃO PARA O TÍTULO FUGIR DO MOUSE E MANTER O ESPAÇO
  const handleFocusEscape = (e) => {
    const target = e.target;
    const parent = target.parentNode;

    let placeholder = parent.querySelector('.focus-placeholder');
    if (!placeholder) {
      placeholder = document.createElement('div');
      placeholder.className = 'focus-placeholder';
      const styles = window.getComputedStyle(target);
      placeholder.style.height = `${target.offsetHeight}px`;
      placeholder.style.marginTop = styles.marginTop;
      placeholder.style.marginBottom = styles.marginBottom;
      placeholder.style.width = '100%'; 
      parent.insertBefore(placeholder, target);
    }

    const padding = 100;
    const newX = Math.random() * (window.innerWidth - padding * 2) + padding;
    const newY = Math.random() * (window.innerHeight - padding * 2) + padding;

    target.style.position = 'fixed';
    target.style.left = `${newX}px`;
    target.style.top = `${newY}px`;
    target.style.zIndex = '3000';
    target.style.transform = 'translate(-50%, -50%)';
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
      // Salva o intervalo se for "Hora"
      hourInterval: taskRepeat === 'Hora' ? taskHourInterval : null,
      tag: taskTag,
      done: false
    };

    setTasks([...tasks, newTask]);
    setTaskInput('');
    setTaskEnd('');
    setTaskHourInterval('');
    setNoDeadline(false);
  };

  const toggleDone = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const removeTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="container-principal">
      <button 
        className="btn-theme-toggle-cat" 
        onClick={() => setIsDarkMode(!isDarkMode)}
        title={isDarkMode ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
      >
        <img 
          src={isDarkMode ? "/cat-open.png" : "/cat-shy.png"} 
          alt="Ícone de Tema" 
          className="cat-theme-icon"
        />
      </button>

      <div className="card welcome-card">
        <img 
          src={isDarkMode ? "/img2.png" : "/img1.png"} 
          className="card-img-top" 
          alt="Banner Focus" 
        />
      </div>

      <div className="input-section">
        <h1 className="app-title" onMouseEnter={handleFocusEscape}>
          Focus
        </h1>

        <div className="progress mb-4">
          <div 
            className="progress-bar progress-bar-striped progress-bar-animated" 
            style={{ width: `${progress}%`, backgroundColor: '#00acc1' }}
          ></div>
        </div>

        <div className="row g-2 mb-4 filtros-container">
          {['todas', 'Trabalho', 'Estudo', 'Pessoal'].map((cat) => (
            <div key={cat} className="col-3">
              <div 
                className={`card-filtro ${filter === cat ? 'active' : ''}`} 
                onClick={() => setFilter(cat)}
              >
                <span>{cat === 'todas' ? 'Todas' : cat === 'Trabalho' ? 'Trabalho' : cat === 'Pessoal' ? 'Vida' : cat}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="planner-card card p-4 mb-4">
          <input 
            className="form-control mb-3"
            placeholder="O que vamos focar agora?" 
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
          />
          
          <div className="row g-2 mb-3">
            <div className="col-6">
              <label className="small label-custom">📅 Início</label>
              <input 
                type="datetime-local" 
                className="form-control" 
                value={taskStart}
                onChange={(e) => setTaskStart(e.target.value)} 
              />
            </div>
            <div className="col-6">
              <label className="small label-custom d-flex justify-content-between align-items-center">
                🏁 Término
                <span style={{ fontSize: '0.65rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    className="me-1"
                    checked={noDeadline}
                    onChange={(e) => setNoDeadline(e.target.checked)}
                  /> Indet.
                </span>
              </label>
              <input 
                type="datetime-local" 
                className="form-control" 
                value={taskEnd}
                disabled={noDeadline}
                onChange={(e) => setTaskEnd(e.target.value)} 
              />
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

          {/* CAIXA CONDICIONAL PARA SELEÇÃO DE HORAS/MINUTOS */}
          {taskRepeat === 'Hora' && (
            <div className="mb-3 animate-fade-in">
              <label className="small label-custom">⏰ Intervalo (Horas e Minutos)</label>
              <input 
                type="time" 
                className="form-control" 
                value={taskHourInterval}
                onChange={(e) => setTaskHourInterval(e.target.value)}
              />
            </div>
          )}

          <button onClick={addTask} className="btn btn-primary w-100 fw-bold">ADICIONAR</button>
        </div>

        <ul id="taskList">
          {tasks
            .filter(t => filter === 'todas' || t.tag === filter)
            .map(t => (
            <li key={t.id} className={t.done ? 'done' : ''} onClick={() => toggleDone(t.id)}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <span className="badge" style={{ backgroundColor: t.tag === 'Trabalho' ? '#00acc1' : t.tag === 'Estudo' ? '#4db6ac' : '#9575cd', fontSize: '0.6rem' }}>{t.tag}</span>
                  <small className="ms-2 opacity-75">{t.effort}</small>
                  {/* Badge extra para indicar repetição horária */}
                  {t.hourInterval && <small className="ms-2 badge bg-info text-white" style={{fontSize: '0.6rem'}}>A cada {t.hourInterval}h</small>}
                  <h5 className="mt-2 mb-0"><strong>{t.text}</strong></h5>
                </div>
                <button className="btn btn-sm text-danger" onClick={(e) => { e.stopPropagation(); removeTask(t.id); }}>
                  🗑️
                </button>
              </div>
              <div className="mt-2 small opacity-75">
                {t.end 
                  ? `Até: ${t.end.getHours()}:${t.end.getMinutes().toString().padStart(2, '0')}` 
                  : "Tempo indeterminado ♾️"}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App