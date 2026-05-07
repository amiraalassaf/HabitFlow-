let habits = [];
let selectedColor = '#FF6B6B';
let draggedHabitId = null;

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
    renderHabits();
}

// دوال Drag & Drop
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
        habit.status = newStatus;
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
            <div class="card-freq">${habit.frequency === 'يومي' ? '📅 يومي' : '📆 أسبوعي'}</div>
        </div>
    `).join('');
}

document.getElementById('saveBtn').addEventListener('click', addHabit);
document.getElementById('habitName').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addHabit();
});

initColorPicker();
renderHabits();