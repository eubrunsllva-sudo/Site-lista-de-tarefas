import { useState, useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth'
import { LocalNotifications } from '@capacitor/local-notifications'
import './App.css'

function App() {
  // --- ESTADOS DE TEMA E GOOGLE ---
  const [googleUser, setGoogleUser] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('focus_theme') === 'true'
  })

  // --- ESTADOS DO MENU E INTERFACE ---
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [selectedDays, setSelectedDays] = useState([])
  const [selectedMonths, setSelectedMonths] = useState([])
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const mesesAno = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

  // --- ESTADOS DO FORMULÁRIO E TAREFAS ---
  const [taskInput, setTaskInput] = useState('')
  const [taskStart, setTaskStart] = useState('')
  const [taskEnd, setTaskEnd] = useState('')
  const [noDeadline, setNoDeadline] = useState(false)
  const [taskEffort, setTaskEffort] = useState('Média 💪')
  const [taskRepeat, setTaskRepeat] = useState('Não')
  const [taskTag, setTaskTag] = useState('Trabalho')
  const [filter, setFilter] = useState('todas')
  const [progress, setProgress] = useState(0)
  const [taskHourInterval, setTaskHourInterval] = useState('00:00')

  // --- INICIALIZAÇÃO E PERSISTÊNCIA ---
  useEffect(() => {
    const init = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          await GoogleAuth.initialize({
            clientId: '217686217989-l39dgiak467ikcba8tqv1ltrhq1oik5c.apps.googleusercontent.com',
            scopes: ['https://www.googleapis.com/auth/drive.appdata', 'email', 'profile']
          })

          await LocalNotifications.createChannel({
            id: 'focustasks',
            name: 'Alertas de Tarefas',
            description: 'Notificações de início de tarefas',
            importance: 5,
            visibility: 1,
            vibration: true,
            sound: 'beep.wav'
          });
        } catch (e) {
          console.warn("Erro na inicialização nativa:", e)
        }
      }
    }
    init()
  }, [])

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('focus_tasks')
    if (savedTasks) {
      try {
        return JSON.parse(savedTasks).map(t => ({
          ...t,
          end: t.end ? new Date(t.end) : null
        }))
      } catch { return [] }
    }
    return []
  })

  useEffect(() => {
    localStorage.setItem('focus_tasks', JSON.stringify(tasks))
    const doneTasks = tasks.length === 0 ? 0 : tasks.filter(t => t.done).length
    setProgress(tasks.length === 0 ? 0 : (doneTasks / tasks.length) * 100)
  }, [tasks])

  useEffect(() => {
    localStorage.setItem('focus_theme', isDarkMode)
    document.body.classList.toggle('dark-mode', isDarkMode)
  }, [isDarkMode])

  // --- LÓGICA DE CONEXÃO GOOGLE ---
  const handleGoogleLogin = async () => {
    try {
      const user = await GoogleAuth.signIn()
      setGoogleUser(user)
      alert("Google Drive conectado! 🚀")
    } catch (error) {
      alert("Erro login Google: " + error.message)
    }
  }

  // --- LÓGICA DO TÍTULO "FUGA" ---
  const handleFocusEscape = (e) => {
    const target = e.currentTarget
    const padding = 100
    const newX = Math.random() * (window.innerWidth - padding * 2) + padding
    const newY = Math.random() * (window.innerHeight - padding * 2) + padding
    target.style.position = 'fixed'
    target.style.left = `${newX}px`
    target.style.top = `${newY}px`
    target.style.zIndex = '100'
    target.style.transform = 'translate(-50%, -50%)'
  }

  const resetFocus = () => {
    const title = document.querySelector('.app-title')
    if (title) {
      Object.assign(title.style, { position: 'relative', left: '0', top: '0', transform: 'none', zIndex: '10' })
    }
  }

  // --- LÓGICA DE TAREFAS ---
  const toggleSelection = (item, state, setState) => {
    state.includes(item) ? setState(state.filter(i => i !== item)) : setState([...state, item])
  }

  const addTask = async () => {
    if (!taskInput.trim() || !taskStart || (!noDeadline && !taskEnd)) {
      alert("Preencha os campos obrigatórios! 🧠")
      return
    }

    const startDate = new Date(taskStart);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);
    const notificationDate = new Date(startDate.getTime() - 60000);

    const newTask = {
      id: Date.now(),
      text: taskInput,
      start: taskStart,
      end: noDeadline ? null : new Date(taskEnd),
      effort: taskEffort,
      repeat: taskRepeat,
      repeatConfig: {
        days: taskRepeat === 'Semanal' ? [...selectedDays] : null,
        months: taskRepeat === 'Mensal' ? [...selectedMonths] : null,
        hourInterval: taskRepeat === 'Hora' ? taskHourInterval : null
      },
      tag: taskTag,
      done: false
    }

    if (Capacitor.isNativePlatform()) {
      try {
        const perms = await LocalNotifications.checkPermissions();
        if (perms.display !== 'granted') {
          await LocalNotifications.requestPermissions();
        }

        await LocalNotifications.schedule({
          notifications: [
            {
              title: "O Focus te chama! 🚀",
              body: `Sua tarefa "${taskInput}" começa em 1 minuto.`,
              id: Math.floor(Date.now() / 1000),
              schedule: {
                at: notificationDate,
                allowWhileIdle: true,
                exact: true,
                repeats: false
              },
              channelId: 'focustasks',
              smallIcon: 'ic_launcher',
              importance: 5
            }
          ]
        });
      } catch (e) {
        console.error("Erro na notificação:", e);
      }
    }

    setTasks([...tasks, newTask])
    setTaskInput(''); setTaskEnd(''); setNoDeadline(false)
    setSelectedDays([]); setSelectedMonths([]); setTaskHourInterval('00:00')
  }

  const toggleDone = id => setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t))
  const removeTask = id => setTasks(tasks.filter(t => t.id !== id))

  // --- LÓGICA DO GOOGLE DRIVE ---
  const handleExportDrive = async () => {
    try {
      if (!googleUser) { alert("Conecte o Google Drive primeiro"); return }
      const accessToken = googleUser.authentication.accessToken
      const listRes = await fetch(`https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name="focus_backup.json"&t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      const listData = await listRes.json()
      const existingFileId = listData.files?.[0]?.id
      const metadata = { name: 'focus_backup.json', mimeType: 'application/json' }
      if (!existingFileId) metadata.parents = ['appDataFolder']
      const formData = new FormData()
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
      formData.append('file', new Blob([JSON.stringify({ date: new Date().toISOString(), tasks })], { type: 'application/json' }))
      const url = existingFileId
        ? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`
        : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart'
      const res = await fetch(url, {
        method: existingFileId ? 'PATCH' : 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData
      })
      if (res.ok) alert("Backup salvo no Drive! ✅")
      else throw new Error("Erro no servidor Google")
      setIsMenuOpen(false)
    } catch (e) { alert("Erro ao exportar: " + e.message) }
  }

  const handleImportDrive = async () => {
    try {
      if (!googleUser) { alert("Conecte o Google Drive primeiro"); return }
      const accessToken = googleUser.authentication.accessToken
      const listRes = await fetch(`https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name="focus_backup.json"&t=${Date.now()}`, { headers: { Authorization: `Bearer ${accessToken}` } })
      const listData = await listRes.json()
      if (listData.files?.length > 0) {
        const fileRes = await fetch(`https://www.googleapis.com/drive/v3/files/${listData.files[0].id}?alt=media`, { headers: { Authorization: `Bearer ${accessToken}` } })
        const backup = await fileRes.json()
        if (backup.tasks) {
          setTasks(backup.tasks.map(t => ({ ...t, end: t.end ? new Date(t.end) : null })))
          alert("Backup carregado! 📥")
        }
      } else alert("Nenhum backup encontrado.")
      setIsMenuOpen(false)
    } catch (e) { alert("Erro ao importar: " + e.message) }
  }

  // --- AUXILIAR FORMATAÇÃO ---
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="container-principal">
      <button className="hamburger-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        <div className="bar"></div><div className="bar"></div><div className="bar"></div>
      </button>

      {isMenuOpen && <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}></div>}

      <div className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Configurações</h3>
          <button className="close-btn" onClick={() => setIsMenuOpen(false)}>&times;</button>
        </div>
        <div className="sidebar-content">
          <button className="menu-item" onClick={handleGoogleLogin}>
            <i className="bi bi-google me-2"></i> Conectar Google Drive
          </button>
          <button className="menu-item" onClick={handleImportDrive}>
            <i className="bi bi-cloud-download me-2"></i> Importar do Drive
          </button>
          <button className="menu-item" onClick={handleExportDrive}>
            <i className="bi bi-cloud-upload me-2"></i> Exportar para o Drive
          </button>
        </div>
      </div>

      <button className="btn-theme-toggle-cat" onClick={() => setIsDarkMode(!isDarkMode)}>
        <img src={isDarkMode ? "cat-open.png" : "cat-shy.png"} alt="Tema" className="cat-theme-icon" />
      </button>

      <div className="app-content">
        <div className="card welcome-card">
          <img src={isDarkMode ? "img2.png" : "img1.png"} className="card-img-top" alt="Banner" />
        </div>

        <div className="input-section">
          <div className="title-container">
            <div className="focus-reset-area" onClick={resetFocus}></div>
            <h1 className="app-title" onMouseEnter={handleFocusEscape}>Focus</h1>
          </div>

          <div className="progress mb-4">
            <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: `${progress}%`, backgroundColor: '#00acc1' }}></div>
          </div>

          <div className="filtros-container mb-4">
            {['todas', 'Trabalho', 'Estudo', 'Pessoal'].map((cat) => (
              <div key={cat} className={`card-filtro ${filter === cat ? 'active' : ''}`} onClick={() => setFilter(cat)}>
                <span>{cat === 'todas' ? 'Todas' : cat === 'Pessoal' ? 'Vida' : cat}</span>
              </div>
            ))}
          </div>

          <div className="planner-card card p-4 mb-4">
            <input className="form-control mb-3" placeholder="O que vamos focar agora?" value={taskInput} onChange={(e) => setTaskInput(e.target.value)} />

            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="small">📅 Início</label>
                <input type="datetime-local" className="form-control" value={taskStart} onChange={(e) => setTaskStart(e.target.value)} />
              </div>
              <div className="col-6">
                <label className="small d-flex justify-content-between">
                  🏁 Término
                  <span style={{ fontSize: '0.65rem' }}>
                    <input type="checkbox" checked={noDeadline} onChange={(e) => setNoDeadline(e.target.checked)} /> Indet.
                  </span>
                </label>
                <input type="datetime-local" className="form-control" value={taskEnd} disabled={noDeadline} onChange={(e) => setTaskEnd(e.target.value)} />
              </div>
            </div>

            {taskRepeat === 'Semanal' && (
              <div className="d-flex flex-wrap gap-1 mb-3 justify-content-center">
                {diasSemana.map(d => (
                  <button key={d} type="button" onClick={() => toggleSelection(d, selectedDays, setSelectedDays)} className={`btn btn-sm ${selectedDays.includes(d) ? 'btn-primary' : 'btn-outline-secondary'}`} style={{ fontSize: '0.7rem' }}>{d}</button>
                ))}
              </div>
            )}

            {taskRepeat === 'Mensal' && (
              <div className="d-flex flex-wrap gap-1 mb-3 justify-content-center">
                {mesesAno.map(m => (
                  <button key={m} type="button" onClick={() => toggleSelection(m, selectedMonths, setSelectedMonths)} className={`btn btn-sm ${selectedMonths.includes(m) ? 'btn-primary' : 'btn-outline-secondary'}`} style={{ fontSize: '0.7rem' }}>{m}</button>
                ))}
              </div>
            )}

            {taskRepeat === 'Hora' && (
              <div className="mb-3">
                <label className="small">Intervalo (Horas:Minutos)</label>
                <input type="time" className="form-control" value={taskHourInterval} onChange={(e) => setTaskHourInterval(e.target.value)} />
              </div>
            )}

            <div className="row g-2 mb-3">
              <div className="col-4">
                <label className="small">🧠 Energia</label>
                <select className="form-select" value={taskEffort} onChange={(e) => setTaskEffort(e.target.value)}>
                  <option value="Baixa ☕">Baixa</option>
                  <option value="Média 💪">Média</option>
                  <option value="Alta 🔥">Alta</option>
                </select>
              </div>
              <div className="col-4">
                <label className="small">🔄 Repetir</label>
                <select className="form-select" value={taskRepeat} onChange={(e) => setTaskRepeat(e.target.value)}>
                  <option value="Não">Não</option>
                  <option value="Hora">Hora</option>
                  <option value="Diário">Diário</option>
                  <option value="Semanal">Semanal</option>
                  <option value="Mensal">Mensal</option>
                </select>
              </div>
              <div className="col-4">
                <label className="small">🏷️ Tag</label>
                <select className="form-select" value={taskTag} onChange={(e) => setTaskTag(e.target.value)}>
                  <option value="Trabalho">Trabalho</option>
                  <option value="Estudo">Estudo</option>
                  <option value="Pessoal">Vida</option>
                </select>
              </div>
            </div>

            <button onClick={addTask} className="btn btn-primary w-100 fw-bold">ADICIONAR</button>
          </div>

          <ul id="taskList">
            {tasks.filter(t => filter === 'todas' || t.tag === filter).map(t => (
              <li key={t.id} className={t.done ? 'done' : ''} onClick={() => toggleDone(t.id)}>
                <div className="d-flex justify-content-between align-items-start w-100">
                  <div className="flex-grow-1">
                    <span className="badge" style={{ backgroundColor: t.tag === 'Trabalho' ? '#00acc1' : t.tag === 'Estudo' ? '#4db6ac' : '#9575cd' }}>{t.tag}</span>
                    <h5 className="mt-2 mb-1">{t.text}</h5>

                    {/* --- INFORMAÇÕES EXTRAS DA TAREFA --- */}
                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                      <div>📅 <b>Início:</b> {formatDateTime(t.start)}</div>
                      {t.end && <div>🏁 <b>Término:</b> {formatDateTime(t.end)}</div>}
                      <div>🧠 <b>Energia:</b> {t.effort}</div>
                      {t.repeat !== 'Não' && <div className="text-info">🔄 Repete: {t.repeat}</div>}
                    </div>
                  </div>
                  <button className="btn btn-sm text-danger" onClick={(e) => { e.stopPropagation(); removeTask(t.id); }}>🗑️</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App