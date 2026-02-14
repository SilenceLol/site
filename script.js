// Состояние приложения
let appState = {
    selectedDate: null,
    currentMonth: new Date(),
    availableDates: []
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    generateAvailableDates();
    renderCalendar();
    updateMonthYear();
    
    // Закрытие календаря при клике вне его
    document.addEventListener('click', function(e) {
        const wrapper = document.querySelector('.date-picker-wrapper');
        const dropdown = document.getElementById('calendarDropdown');
        
        if (!wrapper.contains(e.target) && dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
        }
    });
});

// Инициализация обработчиков событий
function initApp() {
    // Обработчики для полей ввода веса
    const weightInputs = document.querySelectorAll('.weight-input');
    weightInputs.forEach(input => {
        input.addEventListener('input', calculateTotalWeight);
        input.addEventListener('blur', validateInput);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.blur();
            }
        });
    });
    
    // Обработчик для поля выбора даты
    const dateInput = document.getElementById('datePickerInput');
    dateInput.addEventListener('click', function(e) {
        e.stopPropagation();
        document.getElementById('calendarDropdown').classList.toggle('show');
    });
    
    // Обработчики навигации по месяцам
    document.getElementById('prevMonthBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        changeMonth(-1);
    });
    
    document.getElementById('nextMonthBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        changeMonth(1);
    });
    
    // Обработчик отправки заказа
    document.getElementById('orderSubmitBtn').addEventListener('click', handleOrderSubmit);
}

// Генерация доступных дат (ближайшие 3 месяца, кроме воскресений)
function generateAvailableDates() {
    const dates = [];
    const today = new Date();
    const threeMonthsLater = new Date(today);
    threeMonthsLater.setMonth(today.getMonth() + 3);
    
    const currentDate = new Date(today);
    currentDate.setHours(0, 0, 0, 0);
    
    while (currentDate <= threeMonthsLater) {
        // Пропускаем воскресенье (0 - воскресенье в JS)
        if (currentDate.getDay() !== 0) {
            dates.push(new Date(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    appState.availableDates = dates;
}

// Переключение месяца
function changeMonth(delta) {
    appState.currentMonth.setMonth(appState.currentMonth.getMonth() + delta);
    renderCalendar();
    updateMonthYear();
}

// Обновление отображения месяца и года
function updateMonthYear() {
    const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    document.getElementById('currentMonthYear').textContent = 
        `${monthNames[appState.currentMonth.getMonth()]} ${appState.currentMonth.getFullYear()}`;
}

// Рендер календаря
function renderCalendar() {
    const year = appState.currentMonth.getFullYear();
    const month = appState.currentMonth.getMonth();
    
    // Получаем первый день месяца
    const firstDay = new Date(year, month, 1);
    // Получаем последний день месяца
    const lastDay = new Date(year, month + 1, 0);
    
    // Получаем день недели первого дня (пн=0, вс=6)
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;
    
    // Генерируем дни
    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Пустые ячейки до первого дня месяца
    for (let i = 0; i < startDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day disabled';
        emptyDay.textContent = '';
        calendarDays.appendChild(emptyDay);
    }
    
    // Ячейки для дней месяца
    for (let d = 1; d <= lastDay.getDate(); d++) {
        const date = new Date(year, month, d);
        date.setHours(0, 0, 0, 0);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = d;
        
        // Проверяем, доступна ли дата
        const isAvailable = appState.availableDates.some(availDate => 
            availDate.toDateString() === date.toDateString()
        );
        
        // Проверяем, прошлая ли дата
        const isPast = date < today;
        
        // Проверяем, выбранная ли дата
        const isSelected = appState.selectedDate && 
            appState.selectedDate.toDateString() === date.toDateString();
        
        // Проверяем, сегодня ли
        const isToday = date.toDateString() === today.toDateString();
        
        if (!isAvailable || isPast) {
            dayElement.classList.add('disabled');
        } else {
            dayElement.addEventListener('click', (e) => {
                e.stopPropagation();
                selectDate(date);
            });
        }
        
        if (isSelected) {
            dayElement.classList.add('selected');
        }
        
        if (isToday && !isSelected) {
            dayElement.classList.add('today');
        }
        
        calendarDays.appendChild(dayElement);
    }
}

// Выбор даты
function selectDate(date) {
    appState.selectedDate = date;
    
    // Обновляем поле ввода
    const options = { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'long',
        year: 'numeric'
    };
    const formattedDate = date.toLocaleDateString('ru-RU', options);
    document.getElementById('datePickerInput').value = formattedDate;
    
    // Закрываем календарь
    document.getElementById('calendarDropdown').classList.remove('show');
    
    // Обновляем классы в календаре
    renderCalendar();
    
    // Проверяем возможность отправки
    calculateTotalWeight();
    document.getElementById('orderError').textContent = '';
}

// Валидация ввода
function validateInput(e) {
    let value = e.target.value.trim();
    
    if (value === '' || value === '-') {
        e.target.value = '0';
    } else {
        value = value.replace(',', '.');
        let num = parseFloat(value);
        if (!isNaN(num) && num >= 0) {
            e.target.value = Math.round(num * 10) / 10;
        } else {
            e.target.value = '0';
        }
    }
    
    calculateTotalWeight();
}

// Расчет общего веса
function calculateTotalWeight() {
    const weightInputs = document.querySelectorAll('.weight-input');
    let total = 0;
    
    weightInputs.forEach(input => {
        const value = parseFloat(input.value);
        if (!isNaN(value) && value > 0) {
            total += value;
        }
    });
    
    total = Math.round(total * 10) / 10;
    
    document.getElementById('totalWeight').textContent = `Общий вес: ${total} кг`;
    
    // Активируем/деактивируем кнопку отправки
    const submitBtn = document.getElementById('orderSubmitBtn');
    const dateSelected = appState.selectedDate !== null;
    
    submitBtn.disabled = total < 35 || !dateSelected;
}

// Отправка заказа
async function handleOrderSubmit() {
    if (!appState.selectedDate) {
        document.getElementById('orderError').textContent = 'Выберите дату вывоза';
        return;
    }
    
    // Собираем данные о продукции
    const products = {};
    let totalWeight = 0;
    
    document.querySelectorAll('.weight-input').forEach(input => {
        const weight = parseFloat(input.value) || 0;
        if (weight > 0) {
            products[input.dataset.product] = weight;
        }
        totalWeight += weight;
    });
    
    if (totalWeight < 35) {
        document.getElementById('orderError').textContent = 'Общий вес должен быть не менее 35 кг';
        return;
    }
    
    const submitBtn = document.getElementById('orderSubmitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Отправка...';
    submitBtn.disabled = true;
    
    try {
        const response = await mockServerRequest('/submit-order', {
            date: appState.selectedDate.toISOString().split('T')[0],
            products: products,
            totalWeight: totalWeight
        });
        
        if (response.success) {
            showNotification('Заказ успешно отправлен! Номер: ' + response.orderId);
            
            // Очищаем форму
            document.querySelectorAll('.weight-input').forEach(input => {
                input.value = '0';
            });
            
            appState.selectedDate = null;
            document.getElementById('datePickerInput').value = '';
            renderCalendar();
            calculateTotalWeight();
            document.getElementById('orderError').textContent = '';
        } else {
            document.getElementById('orderError').textContent = 'Ошибка при отправке заказа';
        }
    } catch (error) {
        document.getElementById('orderError').textContent = 'Ошибка сервера, попробуйте позже';
    } finally {
        submitBtn.textContent = originalText;
        calculateTotalWeight();
    }
}

// Имитация серверного запроса
function mockServerRequest(endpoint, data) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Отправка данных:', endpoint, data);
            resolve({ 
                success: true,
                orderId: 'ORD_' + Math.random().toString(36).substr(2, 9).toUpperCase()
            });
        }, 1000);
    });
}

// Показать уведомление
function showNotification(message) {
    alert(message);
}

// Функция сброса формы
window.resetForm = function() {
    if (confirm('Сбросить все значения?')) {
        document.querySelectorAll('.weight-input').forEach(input => {
            input.value = '0';
        });
        appState.selectedDate = null;
        document.getElementById('datePickerInput').value = '';
        renderCalendar();
        calculateTotalWeight();
        document.getElementById('orderError').textContent = '';
    }
};
