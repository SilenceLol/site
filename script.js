// Состояние приложения
let appState = {
<<<<<<< HEAD
=======
    selectedDate: null,
    currentMonth: new Date(),
>>>>>>> 16fc469 (Start)
    availableDates: []
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initApp();
<<<<<<< HEAD
    loadAvailableDates();
=======
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
>>>>>>> 16fc469 (Start)
});

// Инициализация обработчиков событий
function initApp() {
    // Обработчики для полей ввода веса
    const weightInputs = document.querySelectorAll('.weight-input');
    weightInputs.forEach(input => {
        input.addEventListener('input', calculateTotalWeight);
<<<<<<< HEAD
        // Добавляем поддержку enter для удобства
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                calculateTotalWeight();
            }
        });
    });
    
=======
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

>>>>>>> 16fc469 (Start)
    // Обработчик отправки заказа
    document.getElementById('orderSubmitBtn').addEventListener('click', handleOrderSubmit);
}

<<<<<<< HEAD
// Загрузка доступных дат из базы (имитация)
function loadAvailableDates() {
    // Имитация запроса к серверу
    setTimeout(() => {
        // Эти даты обычно приходят с сервера
        appState.availableDates = generateNextTwoWeeks();
        
        const dateSelect = document.getElementById('dateSelect');
        dateSelect.innerHTML = '<option value="">Выберите дату вывоза</option>';
        
        appState.availableDates.forEach(date => {
            const option = document.createElement('option');
            option.value = date;
            option.textContent = formatDate(date);
            dateSelect.appendChild(option);
        });
    }, 500);
}

// Генерация дат на ближайшие 2 недели
function generateNextTwoWeeks() {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        // Пропускаем воскресенье (выходной)
        if (date.getDay() !== 0) {
            dates.push(date.toISOString().split('T')[0]);
        }
    }
    return dates;
}

// Форматирование даты для отображения
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'short', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('ru-RU', options);
=======
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
>>>>>>> 16fc469 (Start)
}

// Расчет общего веса
function calculateTotalWeight() {
    const weightInputs = document.querySelectorAll('.weight-input');
    let total = 0;
<<<<<<< HEAD
    
=======

>>>>>>> 16fc469 (Start)
    weightInputs.forEach(input => {
        const value = parseFloat(input.value);
        if (!isNaN(value) && value > 0) {
            total += value;
        }
    });
<<<<<<< HEAD
    
    // Округляем до 1 знака после запятой
    total = Math.round(total * 10) / 10;
    
    document.getElementById('totalWeight').textContent = `Общий вес: ${total} кг`;
    
    // Активируем/деактивируем кнопку отправки
    const submitBtn = document.getElementById('orderSubmitBtn');
    submitBtn.disabled = total < 35;
=======

    total = Math.round(total * 10) / 10;

    document.getElementById('totalWeight').textContent = `Общий вес: ${total} кг`;

    // Активируем/деактивируем кнопку отправки
    const submitBtn = document.getElementById('orderSubmitBtn');
    const dateSelected = appState.selectedDate !== null;

    submitBtn.disabled = total < 35 || !dateSelected;
>>>>>>> 16fc469 (Start)
}

// Отправка заказа
async function handleOrderSubmit() {
<<<<<<< HEAD
    const date = document.getElementById('dateSelect').value;
    
    if (!date) {
        document.getElementById('orderError').textContent = 'Выберите дату вывоза';
        return;
    }
    
    // Собираем данные о продукции
    const products = {};
    let totalWeight = 0;
    
    document.querySelectorAll('.weight-input').forEach(input => {
        const weight = parseFloat(input.value) || 0;
        products[input.dataset.product] = weight;
        totalWeight += weight;
    });
    
    // Проверка минимального веса (на всякий случай)
=======
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

>>>>>>> 16fc469 (Start)
    if (totalWeight < 35) {
        document.getElementById('orderError').textContent = 'Общий вес должен быть не менее 35 кг';
        return;
    }
<<<<<<< HEAD
    
    // Показываем индикатор загрузки на кнопке
=======

>>>>>>> 16fc469 (Start)
    const submitBtn = document.getElementById('orderSubmitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Отправка...';
    submitBtn.disabled = true;
<<<<<<< HEAD
    
    try {
        // Имитация отправки заказа на сервер
        const response = await mockServerRequest('/submit-order', {
            date: date,
            products: products,
            totalWeight: totalWeight
        });
        
        if (response.success) {
            // Успешная отправка
            alert('Заказ успешно отправлен!');
            
            // Очищаем поля веса
            document.querySelectorAll('.weight-input').forEach(input => {
                input.value = '0';
            });
            
            // Сбрасываем выбор даты
            document.getElementById('dateSelect').value = '';
            
            // Обновляем общий вес
            calculateTotalWeight();
            
            // Убираем сообщение об ошибке
=======

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
>>>>>>> 16fc469 (Start)
            document.getElementById('orderError').textContent = '';
        } else {
            document.getElementById('orderError').textContent = 'Ошибка при отправке заказа';
        }
    } catch (error) {
        document.getElementById('orderError').textContent = 'Ошибка сервера, попробуйте позже';
    } finally {
<<<<<<< HEAD
        // Возвращаем кнопку в исходное состояние
        submitBtn.textContent = originalText;
        submitBtn.disabled = totalWeight < 35;
=======
        submitBtn.textContent = originalText;
        calculateTotalWeight();
>>>>>>> 16fc469 (Start)
    }
}

// Имитация серверного запроса
function mockServerRequest(endpoint, data) {
    return new Promise((resolve) => {
        setTimeout(() => {
<<<<<<< HEAD
            console.log('Отправка данных на сервер:', endpoint, data);
            
            // Имитация успешного ответа
            resolve({ 
                success: true,
                message: 'Заказ принят',
                orderId: 'ORD_' + Math.random().toString(36).substr(2, 9).toUpperCase()
            });
        }, 1000); // Задержка 1 секунда для имитации сети
    });
}

// Добавляем возможность быстрой очистки всех полей (для разработки)
function resetAllFields() {
=======
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
>>>>>>> 16fc469 (Start)
    if (confirm('Сбросить все значения?')) {
        document.querySelectorAll('.weight-input').forEach(input => {
            input.value = '0';
        });
<<<<<<< HEAD
        document.getElementById('dateSelect').value = '';
        calculateTotalWeight();
        document.getElementById('orderError').textContent = '';
    }
}

// Добавляем скрытую функцию сброса (можно вызвать из консоли)
window.resetForm = resetAllFields;
=======
        appState.selectedDate = null;
        document.getElementById('datePickerInput').value = '';
        renderCalendar();
        calculateTotalWeight();
        document.getElementById('orderError').textContent = '';
    }
};
>>>>>>> 16fc469 (Start)
