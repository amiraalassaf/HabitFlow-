let habits = JSON.parse(localStorage.getItem('hf2') || '[]');
let selColor = '#22c55e';
let dragId = null;

// COLOR PICKER
document.querySelectorAll('.color-dot').forEach(d => {
  d.addEventListener('click', () => {
    document.querySelectorAll('.color-dot').forEach(x => x.classList.remove('sel'));
    d.classList.add('sel');
    selColor = d.dataset.color;
  });
});

// ADD HABIT (Task 1)
function addHabit() {
  const nameEl = document.getElementById('habit-name');
  const name = nameEl.value.trim();
  if (!name) {
    nameEl.style.borderColor = 'var(--red)';
    setTimeout(() => nameEl.style.borderColor = '', 900);
    return;
  }
  habits.push({
    id: Date.now().toString(),
    name,
    freq: document.getElementById('habit-freq').value,
    color: selColor,
    col: 'backlog'
  });
  save();
  render();
  nameEl.value = '';
}

document.getElementById('habit-name').addEventListener('keydown', e => {
  if (e.key === 'Enter') addHabit();
});

// DRAG (Task 3)
function dragStart(e, id) {
  dragId = id;
  setTimeout(() => {
    const el = document.getElementById('c' + id);
    if (el) el.classList.add('dragging');
  }, 0);
}

function dragEnd(id) {
  const el = document.getElementById('c' + id);
  if (el) el.classList.remove('dragging');
  document.querySelectorAll('.col-body').forEach(c => c.classList.remove('over'));
}

function drop(e, col) {
  e.preventDefault();
  e.currentTarget.classList.remove('over');
  if (!dragId) return;
  
  // WIP LIMIT CHECK
  if (col === 'doing' && habits.filter(h => h.col === 'doing').length >= 3) {
    showToast();
    return;
  }
  
  const h = habits.find(h => h.id === dragId);
  if (h) h.col = col;
  save();
  render();
  dragId = null;
}

// MOVE BUTTONS (Task 3)
function moveNext(id) {
  const h = habits.find(h => h.id === id);
  if (!h) return;
  
  if (h.col === 'backlog') {
    if (habits.filter(x => x.col === 'doing').length >= 3) {
      showToast();
      return;
    }
    h.col = 'doing';
  } else if (h.col === 'doing') {
    h.col = 'done';
  }
  save();
  render();
}

function moveBack(id) {
  const h = habits.find(h => h.id === id);
  if (!h) return;
  
  if (h.col === 'done') {
    h.col = 'doing';
  } else if (h.col === 'doing') {
    h.col = 'backlog';
  }
  save();
  render();
}

function del(id) {
  habits = habits.filter(h => h.id !== id);
  save();
  render();
}

// RENDER (Tasks 2 & 4)
function render() {
  const cols = { backlog: [], doing: [], done: [] };
  habits.forEach(h => cols[h.col].push(h));

  ['backlog', 'doing', 'done'].forEach(col => {
    const body = document.getElementById('col-' + col);
    const emp = document.getElementById('emp-' + col);
    document.getElementById('cnt-' + col).textContent = cols[col].length;
    
    // Remove old cards
    body.querySelectorAll('.habit-card').forEach(c => c.remove());
    emp.style.display = cols[col].length === 0 ? 'block' : 'none';

    cols[col].forEach(h => {
      const card = document.createElement('div');
      card.className = 'habit-card';
      card.id = 'c' + h.id;
      card.draggable = true;
      card.innerHTML = `
        <div class="card-stripe" style="background:${h.color}"></div>
        <div class="card-name">${escapeHtml(h.name)}</div>
        <div class="card-foot">
          <span class="card-freq">${h.freq === 'يومي' ? '📅 يومي' : '📆 أسبوعي'}</span>
          <div class="card-acts">
            ${col !== 'done' ? `<button class="cbtn cbtn-next" onclick="moveNext('${h.id}')">${col === 'backlog' ? '▶ ابدأ' : '✅ أنجزت'}</button>` : ''}
            ${col !== 'backlog' ? `<button class="cbtn cbtn-back" onclick="moveBack('${h.id}')">◀ رجوع</button>` : ''}
            <button class="cbtn cbtn-del" onclick="del('${h.id}')">🗑</button>
          </div>
        </div>`;
      
      card.addEventListener('dragstart', e => dragStart(e, h.id));
      card.addEventListener('dragend', () => dragEnd(h.id));
      body.appendChild(card);
    });
  });

  // Report (Task 4)
  const total = habits.length;
  const done = cols.done.length;
  const doing = cols.doing.length;
  const back = cols.backlog.length;
  const pct = total === 0 ? 0 : Math.round(done / total * 100);

  document.getElementById('r-total').textContent = total;
  document.getElementById('r-done').textContent = done;
  document.getElementById('r-doing').textContent = doing;
  document.getElementById('r-backlog').textContent = back;
  document.getElementById('prog').style.width = pct + '%';
  document.getElementById('pct').textContent = pct + '%';
  document.getElementById('h-total').textContent = total;
  document.getElementById('h-done').textContent = done;
  document.getElementById('h-pending').textContent = back;

  // Mini list
  const ml = document.getElementById('mini-list');
  ml.innerHTML = habits.length === 0
    ? '<p style="color:var(--text-muted);font-size:12px;text-align:center">لا توجد عادات بعد</p>'
    : habits.map(h => `
      <div class="habit-mini">
        <div class="dot-mini" style="background:${h.color}"></div>
        <span>${escapeHtml(h.name)}</span>
        <span class="badge-freq">${h.freq}</span>
      </div>`).join('');
}

// Helper function to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast() {
  const t = document.getElementById('toast');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

function save() {
  localStorage.setItem('hf2', JSON.stringify(habits));
}

// Initialize
render();