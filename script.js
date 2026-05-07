let habits = [];
let selectedColor = '#FF6B6B';
let draggedHabitId = null;

function showWipToast() {
    let toast = document.getElementById('wipToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'wipToast';
        toast.style.cssText = `
            position: fixed; bottom: 30px; left: 50%;
            transform: translateX(-50%);
            background: #ff4757; color: white;
            padding: 12px 24px; border-radius: 10px;
            font-weight: bold; z-index: 1000;
            opacity: 0; transition: opacity 0.3s;
            pointer-events: none;
        `;
        toast.textContent = '⚠️ لا يمكن إضافة أكثر من 3 عادات في قيد التنفيذ!';
        document.body.appendChild(toast);
    }
    toast.style.opacity = '1';
    setTimeout(() => toast.style.opacity = '0', 3000);
}

function saveToLocalStorage() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

function loadFromLocalStorage() {
    const stored = localStorage.getItem('habits');
    if (stored) {
        habits = JSON.parse(stored);
        renderHabits();
    }
}

// ========== تحديث الإحصائيات (جديد) ==========
function updateStats() {
    const total = habits.length;
    const done = habits.filter(h => h.status === 'done').length;
    const progress = habits.filter(h => h.status === 'progress').length;
    const todo = habits.filter(h => h.status === 'todo').length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    
    document.getElementById('totalCount').textContent = total;
    document.getElementById('doneCount').textContent = done;
    document.getElementById('progressCount').textContent = progress;
    document.getElementById('todoCount').textContent = todo;
    document.getElementById('progressBar').style.width = `${percent}%`;
    document.getElementById('progressPercent').textContent = `${percent}%`;
}

function initColorPicker() {
    const colors = document.querySelectorAll('.color-option');
    colors.forEach(color => {
        color.addEventListener('click', () => {
            colors.forEach(c => c.classList.remove('selected'));
            color.classList.add('selected');
            selectedColor = color.dataset.color;
        });
    });
    if (colors.length > 0) colors[0].classList.add('selected');
}

function addHabit() {
    const name = document.getElementById('habitName').value.trim();
    const frequency = document.getElementById('habitFrequency').value;
    
    if (!name) {
        alert('الرجاء إدخال اسم العادة');
        return;
    }
    
    habits.push({
        id: Date.now(),
        name: name,
        frequency: frequency,
        color: selectedColor,
        status: 'todo'
    });
    
    document.getElementById('habitName').value = '';
    saveToLocalStorage();
    renderHabits();
}

function dragStart(event, habitId) {
    draggedHabitId = habitId;
    event.dataTransfer.setData('text/plain', habitId);
    event.target.classList.add('dragging');
}

function dragEnd(event) {
    draggedHabitId = null;
    if (event.target) event.target.classList.remove('dragging');
}

function allowDrop(event) {
    event.preventDefault();
}

function drop(event, newStatus) {
    event.preventDefault();
    const habitId = draggedHabitId || event.dataTransfer.getData('text/plain');
    
    if (!habitId) return;
    
    const habit = habits.find(h => h.id == habitId);
    if (habit) {
        if (newStatus === 'progress' && habit.status !== 'progress') {
            const progressCount = habits.filter(h => h.status === 'progress').length;
            if (progressCount >= 3) {
                showWipToast();
                draggedHabitId = null;
                return;
            }
        }
        
        habit.status = newStatus;
        saveToLocalStorage();
        renderHabits();
    }
    
    draggedHabitId = null;
}

function renderHabits() {
    const todoHabits = habits.filter(h => h.status === 'todo');
    const progressHabits = habits.filter(h => h.status === 'progress');
    const doneHabits = habits.filter(h => h.status === 'done');
    
    const todoContainer = document.getElementById('cardsTodo');
    todoContainer.innerHTML = todoHabits.map(habit => `
        <div class="habit-card" 
             style="border-right-color: ${habit.color}"
             draggable="true"
             ondragstart="dragStart(event, ${habit.id})"
             ondragend="dragEnd(event)">
            <div class="card-name">${habit.name}</div>
            <div class="card-freq">${habit.frequency === 'يومي' ? '📅 يومي' : '📆 أسبوعي'}</div>
        </div>
    `).join('');
    
    const progressContainer = document.getElementById('cardsProgress');
    progressContainer.innerHTML = progressHabits.map(habit => `
        <div class="habit-card" 
             style="border-right-color: ${habit.color}"
             draggable="true"
             ondragstart="dragStart(event, ${habit.id})"
             ondragend="dragEnd(event)">
            <div class="card-name">${habit.name}</div>
            <div class="card-freq">${habit.frequency === 'يومي' ? '📅 يومي' : '📆 أسبوعي'}</div>
        </div>
    `).join('');
    
    const doneContainer = document.getElementById('cardsDone');
    doneContainer.innerHTML = doneHabits.map(habit => `
        <div class="habit-card" 
             style="border-right-color: ${habit.color}"
             draggable="true"
             ondragstart="dragStart(event, ${habit.id})"
             ondragend="dragEnd(event)">
            <div class="card-name">${habit.name}</div>
            <div class="card-freq">${habit.frequency === 'يومي' ? '📅 يومي' : '📆 اسبوعي'}</div>
        </div>
    `).join('');
    
    // تحديث الإحصائيات
    updateStats();
}

document.getElementById('saveBtn').addEventListener('click', addHabit);
document.getElementById('habitName').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addHabit();
});

initColorPicker();
loadFromLocalStorage();