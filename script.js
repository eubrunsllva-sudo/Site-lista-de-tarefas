// Alternar Tema
function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById('toggleTheme');
    
    if (body.classList.contains('light-mode')) {
        body.classList.replace('light-mode', 'dark-mode');
        btn.innerHTML = '<i class="bi bi-sun-fill"></i>';
    } else {
        body.classList.replace('dark-mode', 'light-mode');
        btn.innerHTML = '<i class="bi bi-moon-stars-fill"></i>';
    }
}

function addTask() {
    const input = document.getElementById('taskInput');
    const startInput = document.getElementById('taskStart');
    const endInput = document.getElementById('taskEnd');
    const effortInput = document.getElementById('taskEffort');
    const repeatInput = document.getElementById('taskRepeat');
    const tagInput = document.getElementById('taskTag');
    const list = document.getElementById('taskList');

    if (!input.value.trim() || !startInput.value || !endInput.value) {
        alert("Preencha tudo! 🧠");
        return;
    }

    const end = new Date(endInput.value);
    const tagColor = tagInput.options[tagInput.selectedIndex].getAttribute('data-color');
    const li = document.createElement('li');
    
    li.onclick = function(e) {
        if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'I') {
            this.classList.toggle('done');
            updateProgress();
        }
    };

    li.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
            <div>
                <span class="badge" style="background-color: ${tagColor}; font-size: 0.6rem;">${tagInput.value}</span>
                <small class="ms-2 opacity-75">${effortInput.value}</small>
                <h5 class="mt-2 mb-0"><strong>${input.value}</strong></h5>
            </div>
            <button class="btn btn-sm text-danger" onclick="this.closest('li').remove(); updateProgress();">
                <i class="bi bi-trash3"></i>
            </button>
        </div>
        <div class="mt-2 small opacity-75">
            <i class="bi bi-alarm"></i> Até: ${end.getHours()}:${end.getMinutes().toString().padStart(2, '0')}
            ${repeatInput.value !== 'Não' ? `<span class="ms-2">🔄 ${repeatInput.value}</span>` : ''}
        </div>
    `;

    list.appendChild(li);
    input.value = "";
    updateProgress();
}

function updateProgress() {
    const tasks = document.querySelectorAll('#taskList li');
    const done = document.querySelectorAll('#taskList li.done');
    const bar = document.getElementById('progressBar');
    bar.style.width = tasks.length > 0 ? (done.length / tasks.length * 100) + "%" : "0%";
}

function filterTasks(categoria) {
    const tasks = document.querySelectorAll('#taskList li');
    tasks.forEach(li => {
        const tag = li.querySelector('.badge').textContent.trim();
        li.style.display = (categoria === 'todas' || tag === categoria) ? 'block' : 'none';
    });
}