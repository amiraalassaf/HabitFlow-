// مصفوفة العادات
let habits = [];
let selectedColor = '#FF6B6B';

// تهيئة منتقي الألوان
function initColorPicker() {
    const colors = document.querySelectorAll('.color-option');
    colors.forEach(color => {
        color.addEventListener('click', () => {
            colors.forEach(c => c.classList.remove('selected'));
            color.classList.add('selected');
            selectedColor = color.dataset.color;
        });
    });
    if (colors.length > 0) {
        colors[0].classList.add('selected');
    }
}

// إضافة عادة جديدة
function addHabit() {
    const name = document.getElementById('habitName').value.trim();
    const frequency = document.getElementById('habitFrequency').value;
    
    if (!name) {
        alert('الرجاء إدخال اسم العادة');
        return;
    }
    
    const newHabit = {
        id: Date.now(),
        name: name,
        frequency: frequency,
        color: selectedColor,
        status: 'todo'
    };
    
    habits.push(newHabit);
    document.getElementById('habitName').value = '';
    renderHabits();
}

// عرض العادات في اللوحة
function renderHabits() {
    const todoHabits = habits.filter(h => h.status === 'todo');
    const progressHabits = habits.filter(h => h.status === 'progress');
    const doneHabits = habits.filter(h => h.status === 'done');
    
    const todoContainer = document.getElementById('cardsTodo');
    todoContainer.innerHTML = todoHabits.map(habit => `
        <div class="habit-card" style="border-right-color: ${habit.color}">
            <div class="card-name">${habit.name}</div>
            <div class="card-freq">${habit.frequency === 'يومي' ? '📅 يومي' : '📆 أسبوعي'}</div>
        </div>
    `).join('');
    
    const progressContainer = document.getElementById('cardsProgress');
    progressContainer.innerHTML = progressHabits.map(habit => `
        <div class="habit-card" style="border-right-color: ${habit.color}">
            <div class="card-name">${habit.name}</div>
            <div class="card-freq">${habit.frequency === 'يومي' ? '📅 يومي' : '📆 أسبوعي'}</div>
        </div>
    `).join('');
    
    const doneContainer = document.getElementById('cardsDone');
    doneContainer.innerHTML = doneHabits.map(habit => `
        <div class="habit-card" style="border-right-color: ${habit.color}">
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