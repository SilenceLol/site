// Состояние приложения
let appState = {
    selectedDate: null,
    availableDates: []
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    loadAvailableDates();
});

// Инициализация обработчиков событий
function initApp() {
    // Обработчики для полей ввода веса
    const weightInputs = document.querySelectorAll('.weight-input');
    weightInputs.forEach(input => {
        // Убираем value="0" и добавляем пустой placeholder
        input.value = '';

        input.addEventListener('input', calculateTotalWeight);
        input.addEventListener('blur', validateInput);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.blur();
            }
        });
    });

    // Обработчик отправки заказа
    document.getElementById('orderSubmitBtn').addEventListener('click', handleOrderSubmit);
}

// Загрузка доступных дат (имитация запроса к БД)
function loadAvailableDates() {
    // Показываем загрузку
    const datesButtons = document.getElementById('datesButtons');
    datesButtons.innerHTML = '<div class="loading-dates">Загрузка доступных дат...</div>';

    // Имитация запроса к серверу
    setTimeout(() => {
        // Генерируем 3 ближайшие даты
        appState.availableDates = generateNextDates(3);
        renderDatesButtons();
    }, 800);
}

// Генерация ближайших доступных дат
function generateNextDates(count) {
    const dates = [];
    const today = new Date();
    let currentDate = new Date(today);

    while (dates.length < count) {
        currentDate.setDate(currentDate.getDate() + 1);

        // Пропускаем воскресенье (0 - воскресенье)
        if (currentDate.getDay() !== 0) {
            dates.push(new Date(currentDate));
        }
    }

    return dates;
}

// Рендер кнопок с датами
function renderDatesButtons() {
    const datesButtons = document.getElementById('datesButtons');
    datesButtons.innerHTML = '';

    if (!appState.availableDates || appState.availableDates.length === 0) {
        datesButtons.innerHTML = '<div class="loading-dates">Нет доступных дат</div>';
        return;
    }

    const monthNames = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];

    const weekdayNames = [
        'Воскресенье', 'Понедельник', 'Вторник', 'Среда',
        'Четверг', 'Пятница', 'Суббота'
    ];

    appState.availableDates.forEach((date, index) => {
        const day = date.getDate();
        const month = monthNames[date.getMonth()];
        const weekday = weekdayNames[date.getDay()];
        const dateStr = date.toISOString().split('T')[0];

        const dateBtn = document.createElement('button');
        dateBtn.type = 'button';
        dateBtn.className = 'date-btn';
        dateBtn.dataset.date = dateStr;

        dateBtn.innerHTML = `
            <span class="date-icon">${day}</span>
            <span class="date-info">
                <span class="date-number">${day} ${month}</span>
                <span class="date-weekday">${weekday}</span>
            </span>
        `;

        dateBtn.addEventListener('click', () => selectDate(date));
        datesButtons.appendChild(dateBtn);
    });
}

// Выбор даты
function selectDate(date) {
    appState.selectedDate = date;

    // Обновляем выделение кнопок
    document.querySelectorAll('.date-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.date === date.toISOString().split('T')[0]) {
            btn.classList.add('selected');
        }
    });

    // Проверяем возможность отправки
    calculateTotalWeight();
    document.getElementById('orderError').textContent = '';
}

// Валидация ввода
function validateInput(e) {
    let value = e.target.value.trim();

    if (value === '' || value === '-') {
        e.target.value = '';
    } else {
        value = value.replace(',', '.');
        let num = parseFloat(value);
        if (!isNaN(num) && num >= 0) {
            e.target.value = Math.round(num * 10) / 10;
        } else {
            e.target.value = '';
        }
    }

    calculateTotalWeight();
}

// Расчет общего веса
function calculateTotalWeight() {
    const weightInputs = document.querySelectorAll('.weight-input');
    let total = 0;
    let hasValue = false;

    weightInputs.forEach(input => {
        const value = parseFloat(input.value);
        if (!isNaN(value) && value > 0) {
            total += value;
            hasValue = true;
        }
    });

    total = Math.round(total * 10) / 10;

    document.getElementById('totalWeight').textContent = `Общий вес: ${total} кг`;

    // Активируем/деактивируем кнопку отправки
    const submitBtn = document.getElementById('orderSubmitBtn');
    const dateSelected = appState.selectedDate !== null;

    // Кнопка активна только если выбрана дата И общий вес >= 35
    submitBtn.disabled = !dateSelected || total < 35;

    console.log('Кнопка отправки:', {dateSelected, total, disabled: submitBtn.disabled});
}

// Отправка заказа
async function handleOrderSubmit() {
    console.log('Отправка заказа...');

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
        // Имитация отправки на сервер
        const response = await mockServerRequest('/submit-order', {
            date: appState.selectedDate.toISOString().split('T')[0],
            products: products,
            totalWeight: totalWeight
        });

        if (response.success) {
            showNotification('✅ Заказ успешно отправлен!\nНомер: ' + response.orderId);

            // Очищаем форму
            document.querySelectorAll('.weight-input').forEach(input => {
                input.value = '';
            });

            appState.selectedDate = null;
            document.querySelectorAll('.date-btn').forEach(btn => {
                btn.classList.remove('selected');
            });

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
            input.value = '';
        });
        appState.selectedDate = null;
        document.querySelectorAll('.date-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        calculateTotalWeight();
        document.getElementById('orderError').textContent = '';
    }
};

// Функция для обновления дат из БД (будет вызываться извне)
window.updateAvailableDates = function(dates) {
    appState.availableDates = dates.map(dateStr => new Date(dateStr));
    renderDatesButtons();
};

