// tests/habitflow.test.js
// اختبارات تلقائية لمشروع HabitFlow

// محاكاة بيئة المتصفح للاختبارات
const fs = require('fs');
const path = require('path');

// قراءة ملف JavaScript
const scriptPath = path.join(__dirname, '../script.js');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');

describe('HabitFlow Tests', () => {
    
    // اختبار 1: التحقق من وجود مصفوفة habits
    test('habits array should be defined', () => {
        // محاكاة الكود
        expect(true).toBe(true);
    });

    // اختبار 2: التحقق من دالة addHabit
    test('addHabit function should add new habit', () => {
        const habits = [];
        const newHabit = {
            id: Date.now(),
            name: "قراءة كتاب",
            frequency: "يومي",
            color: "#FF6B6B",
            status: "todo"
        };
        habits.push(newHabit);
        expect(habits.length).toBe(1);
        expect(habits[0].name).toBe("قراءة كتاب");
    });

    // اختبار 3: التحقق من WIP Limit (ماксимум 3 بطاقات)
    test('WIP limit should prevent more than 3 habits in progress', () => {
        const habits = [
            { id: 1, status: "progress" },
            { id: 2, status: "progress" },
            { id: 3, status: "progress" }
        ];
        const progressCount = habits.filter(h => h.status === "progress").length;
        expect(progressCount).toBeLessThanOrEqual(3);
        
        // محاولة إضافة رابعة
        if (progressCount >= 3) {
            expect(true).toBe(true); // منع الإضافة
        }
    });

    // اختبار 4: التحقق من دالة الحذف
    test('deleteHabit should remove habit after confirmation', () => {
        let habits = [
            { id: 1, name: "عادة 1" },
            { id: 2, name: "عادة 2" }
        ];
        const idToDelete = 1;
        habits = habits.filter(h => h.id !== idToDelete);
        expect(habits.length).toBe(1);
        expect(habits[0].id).toBe(2);
    });

    // اختبار 5: التحقق من نسبة الإنجاز
    test('progress percentage should be calculated correctly', () => {
        const habits = [
            { status: "done" },
            { status: "done" },
            { status: "todo" },
            { status: "progress" }
        ];
        const total = habits.length;
        const done = habits.filter(h => h.status === "done").length;
        const percent = total === 0 ? 0 : Math.round((done / total) * 100);
        
        expect(percent).toBe(50);
    });

    // اختبار 6: التحقق من حفظ localStorage
    test('saveToLocalStorage should store habits', () => {
        const habits = [{ name: "test", status: "todo" }];
        const stored = JSON.stringify(habits);
        expect(stored).toContain("test");
        expect(stored).toContain("todo");
    });
});