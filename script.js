// تحميل البيانات من localStorage
let habits = JSON.parse(localStorage.getItem('habits')) || [];

// عند تحميل الصفحة
window.onload = function() {
    renderBoard();
    updateReport();
};

// إضافة عادة جديدة
function addHabit() {
    const name = document.getElementById('habitName').value;
    const frequency = document.getElementById('habitFrequency').value;
    
    if (!name.trim()) {
        alert('الرجاء إدخال اسم العادة');
        return;
    }
    
    const newHabit = {
        id: Date.now(),
        name: name,
        frequency: frequency,
        status: 'todo', // todo, doing, done
        createdAt: new Date().toISOString(),
        completedAt: null
    };
    
    habits.push(newHabit);
    saveAndRender();
    
    // مسح الحقول
    document.getElementById('habitName').value = '';
}

// حفظ وعرض
function saveAndRender() {
    localStorage.setItem('habits', JSON.stringify(habits));
    renderBoard();
    updateReport();
}

// عرض اللوحة
function renderBoard() {
    const todoCards = document.getElementById('todo-cards');
    const doingCards = document.getElementById('doing-cards');
    const doneCards = document.getElementById('done-cards');
    
    // تفريغ الأعمدة
    todoCards.innerHTML = '';
    doingCards.innerHTML = '';
    doneCards.innerHTML = '';
    
    habits.forEach(habit => {
        const card = createCard(habit);
        
        if (habit.status === 'todo') {
            todoCards.appendChild(card);
        } else if (habit.status === 'doing') {
            doingCards.appendChild(card);
        } else if (habit.status === 'done') {
            doneCards.appendChild(card);
        }
    });
    
    // التحقق من WIP Limit
    checkWipLimit();
}

// إنشاء بطاقة عادة
function createCard(habit) {
    const card = document.createElement('div');
    card.className = `habit-card ${habit.frequency}`;
    card.draggable = true;
    card.setAttribute('data-id', habit.id);
    
    card.innerHTML = `
        <div class="habit-name">${habit.name}</div>
        <div class="habit-frequency">${habit.frequency === 'daily' ? '📅 يومي' : '📆 أسبوعي'}</div>
    `;
    
    // إضافة أحداث السحب والإفلات
    card.addEventListener('dragstart', dragStart);
    card.addEventListener('dragend', dragEnd);
    
    return card;
}

// متغيرات السحب والإفلات
let draggedItem = null;

function dragStart(e) {
    draggedItem = this;
    e.dataTransfer.setData('text/plain', this.getAttribute('data-id'));
    this.style.opacity = '0.5';
}

function dragEnd(e) {
    this.style.opacity = '';
    draggedItem = null;
}

// إضافة أحداث الإفلات للأعمدة
document.getElementById('todo-cards').addEventListener('dragover', dragOver);
document.getElementById('doing-cards').addEventListener('dragover', dragOver);
document.getElementById('done-cards').addEventListener('dragover', dragOver);

document.getElementById('todo-cards').addEventListener('drop', drop);
document.getElementById('doing-cards').addEventListener('drop', drop);
document.getElementById('done-cards').addEventListener('drop', drop);

function dragOver(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    const targetColumn = this.parentElement.id;
    const habitId = parseInt(e.dataTransfer.getData('text/plain'));
    
    updateHabitStatus(habitId, targetColumn);
}

// تحديث حالة العادة
function updateHabitStatus(habitId, newStatus) {
    const habit = habits.find(h => h.id === habitId);
    
    if (!habit) return;
    
    // التحقق من WIP Limit قبل النقل إلى Doing
    if (newStatus === 'doing') {
        const doingCount = habits.filter(h => h.status === 'doing').length;
        if (doingCount >= 3) {
            alert('❌ لا يمكن إضافة المزيد! الحد الأقصى للعادات قيد التنفيذ هو 3');
            return;
        }
    }
    
    // تحديث الحالة
    habit.status = newStatus;
    
    // إذا تم الإنجاز (نقل إلى Done)
    if (newStatus === 'done' && !habit.completedAt) {
        habit.completedAt = new Date().toISOString();
    }
    
    saveAndRender();
}

// التحقق من WIP Limit
function checkWipLimit() {
    const doingCount = habits.filter(h => h.status === 'doing').length;
    const wipMessage = document.querySelector('#doing .wip-limit');
    
    if (doingCount >= 3) {
        wipMessage.style.color = 'red';
        wipMessage.style.fontWeight = 'bold';
    } else {
        wipMessage.style.color = '#999';
        wipMessage.style.fontWeight = 'normal';
    }
}

// تحديث تقرير الإنجاز اليومي
function updateReport() {
    const today = new Date().toDateString();
    
    // العادات المنجزة اليوم
    const todayDone = habits.filter(habit => {
        if (!habit.completedAt) return false;
        const completedDate = new Date(habit.completedAt).toDateString();
        return habit.status === 'done' && completedDate === today;
    });
    
    const dailyCount = todayDone.length;
    const totalHabits = habits.length;
    const remainingCount = totalHabits - dailyCount;
    
    // تحديث الأرقام
    document.getElementById('dailyCount').textContent = dailyCount;
    document.getElementById('remainingCount').textContent = remainingCount;
    
    // تلوين الأرقام
    const dailyElement = document.getElementById('dailyCount');
    const remainingElement = document.getElementById('remainingCount');
    
    if (dailyCount > 0) {
        dailyElement.style.color = '#4CAF50'; // أخضر
    } else {
        dailyElement.style.color = '#ff6b6b'; // أحمر
    }
    
    if (remainingCount === 0) {
        remainingElement.style.color = '#4CAF50';
    } else {
        remainingElement.style.color = '#ff6b6b';
    }
}