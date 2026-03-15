import { useState } from "react"

function TaskForm() {

  const [task, setTask] = useState("")
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [energy, setEnergy] = useState("Média")
  const [repeat, setRepeat] = useState("Não")
  const [tag, setTag] = useState("Trampo")

  function handleSubmit(e){
    e.preventDefault()

    const newTask = {
      task,
      start,
      end,
      energy,
      repeat,
      tag
    }

    console.log(newTask)

    setTask("")
  }

  return (

    <form className="task-card" onSubmit={handleSubmit}>

      <input
        className="task-input-main"
        placeholder="O que vamos focar agora?"
        value={task}
        onChange={(e)=>setTask(e.target.value)}
      />

      <div className="date-row">

        <div className="field">
          <label>📅 Início</label>
          <input
            type="date"
            value={start}
            onChange={(e)=>setStart(e.target.value)}
          />
        </div>

        <div className="field">
          <label>🏁 Término</label>
          <input
            type="date"
            value={end}
            onChange={(e)=>setEnd(e.target.value)}
          />
        </div>

      </div>

      <div className="options-row">

        <div className="field">
          <label>🧠 Energia</label>
          <select
            value={energy}
            onChange={(e)=>setEnergy(e.target.value)}
          >
            <option>Baixa</option>
            <option>Média</option>
            <option>Alta</option>
          </select>
        </div>

        <div className="field">
          <label>🔁 Repetir</label>
          <select
            value={repeat}
            onChange={(e)=>setRepeat(e.target.value)}
          >
            <option>Não</option>
            <option>Diário</option>
            <option>Semanal</option>
          </select>
        </div>

        <div className="field">
          <label>🏷 Tag</label>
          <select
            value={tag}
            onChange={(e)=>setTag(e.target.value)}
          >
            <option>Trampo</option>
            <option>Estudo</option>
            <option>Vida</option>
          </select>
        </div>

      </div>

      <button className="add-button">
        ADICIONAR
      </button>

    </form>

  )

}

export default TaskForm