// ========== المتغيرات العامة ==========
let habits = [];
let selectedColor = '#FF6B6B';
let draggedHabitId = null;

// ========== Toast Element ==========
function showWipToast() {
    const toast = document.getElementById('wipToast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ========== تاسك 3: حفظ وتحميل localStorage ==========
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

// ========== تاسك 1: منتقي الألوان ==========
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

// ========== تاسك 1: إضافة عادة جديدة ==========
function addHabit() {
    const name = document.getElementById('habitName').value.trim();
    const frequency = document.getElementById('habitFrequency').value;
    
    if (!name) {
        alert('⚠️ الرجاء إدخال اسم العادة');
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
    saveToLocalStorage();
    renderHabits();
}

// ========== تاسك 2: Drag & Drop ==========
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
        // ========== تاسك 4: WIP Limit ==========
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

// ========== نقل العادة يدوياً (أزرار بدلاً من السحب) ==========
function moveHabit(habitId, direction) {
    const habit = habits.find(h => h.id == habitId);
    if (!habit) return;
    
    let newStatus = habit.status;
    
    if (direction === 'next') {
        if (habit.status === 'todo') newStatus = 'progress';
        else if (habit.status === 'progress') newStatus = 'done';
    } else if (direction === 'prev') {
        if (habit.status === 'done') newStatus = 'progress';
        else if (habit.status === 'progress') newStatus = 'todo';
    }
    
    // التحقق من WIP Limit عند النقل إلى IN PROGRESS
    if (newStatus === 'progress' && habit.status !== 'progress') {
        const progressCount = habits.filter(h => h.status === 'progress').length;
        if (progressCount >= 3) {
            showWipToast();
            return;
        }
    }
    
    habit.status = newStatus;
    saveToLocalStorage();
    renderHabits();
}

// ========== تاسك 6: حذف عادة مع رسالة تأكيد (Confirm Dialog) ==========
function deleteHabit(habitId) {
    const confirmed = confirm('⚠️ هل أنت متأكد من حذف هذه العادة؟\n\nلا يمكنك التراجع عن هذا الإجراء.');
    
    if (confirmed) {
        habits = habits.filter(h => h.id != habitId);
        saveToLocalStorage();
        renderHabits();
    }
}

// ========== تاسك 5: تحديث الإحصائيات وشريط التقدم ==========
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

// ========== عرض جميع العادات في اللوحة (مع أزرار التحكم والحذف) ==========
function renderHabits() {
    const todoHabits = habits.filter(h => h.status === 'todo');
    const progressHabits = habits.filter(h => h.status === 'progress');
    const doneHabits = habits.filter(h => h.status === 'done');
    
    // عرض في عمود TO DO
    const todoContainer = document.getElementById('cardsTodo');
    todoContainer.innerHTML = todoHabits.map(habit => `
        <div class="habit-card" 
             style="border-right-color: ${habit.color}"
             draggable="true"
             ondragstart="dragStart(event, ${habit.id})"
             ondragend="dragEnd(event)">
            <div class="card-name">${habit.name}</div>
            <div class="card-freq">${habit.frequency === 'يومي' ? '📅 يومي' : '📆 أسبوعي'}</div>
            <div class="card-actions">
                <button class="move-btn" onclick="moveHabit(${habit.id}, 'next')">▶ ابدأ</button>
                <button class="delete-btn" onclick="deleteHabit(${habit.id})">🗑 حذف</button>
            </div>
        </div>
    `).join('');
    
    // عرض في عمود IN PROGRESS
    const progressContainer = document.getElementById('cardsProgress');
    progressContainer.innerHTML = progressHabits.map(habit => `
        <div class="habit-card" 
             style="border-right-color: ${habit.color}"
             draggable="true"
             ondragstart="dragStart(event, ${habit.id})"
             ondragend="dragEnd(event)">
            <div class="card-name">${habit.name}</div>
            <div class="card-freq">${habit.frequency === 'يومي' ? '📅 يومي' : '📆 أسبوعي'}</div>
            <div class="card-actions">
                <button class="move-btn" onclick="moveHabit(${habit.id}, 'prev')">◀ رجوع</button>
                <button class="move-btn" onclick="moveHabit(${habit.id}, 'next')">✅ أنجزت</button>
                <button class="delete-btn" onclick="deleteHabit(${habit.id})">🗑 حذف</button>
            </div>
        </div>
    `).join('');
    
    // عرض في عمود DONE
    const doneContainer = document.getElementById('cardsDone');
    doneContainer.innerHTML = doneHabits.map(habit => `
        <div class="habit-card" 
             style="border-right-color: ${habit.color}"
             draggable="true"
             ondragstart="dragStart(event, ${habit.id})"
             ondragend="dragEnd(event)">
            <div class="card-name">${habit.name}</div>
            <div class="card-freq">${habit.frequency === 'يومي' ? '📅 يومي' : '📆 أسبوعي'}</div>
            <div class="card-actions">
                <button class="move-btn" onclick="moveHabit(${habit.id}, 'prev')">◀ رجوع</button>
                <button class="delete-btn" onclick="deleteHabit(${habit.id})">🗑 حذف</button>
            </div>
        </div>
    `).join('');
    
    // تحديث الإحصائيات
    updateStats();
}

// ========== تهيئة الصفحة والأحداث ==========
document.getElementById('saveBtn').addEventListener('click', addHabit);
document.getElementById('habitName').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addHabit();
});

initColorPicker();
loadFromLocalStorage();