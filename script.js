// Состояние приложения
let appState = {
    selectedDate: null,
    availableDates: []
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    loadAvailableDates();
    optimizeHeight();
});

// Оптимизация высоты
function optimizeHeight() {
    const setHeight = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setHeight();
    window.addEventListener('resize', setHeight);
}

// Инициализация обработчиков событий
function initApp() {
    // Обработчики для полей ввода веса
    const weightInputs = document.querySelectorAll('.weight-input');
    weightInputs.forEach(input => {
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

// Загрузка доступных дат
function loadAvailableDates() {
    const datesButtons = document.getElementById('datesButtons');
    datesButtons.innerHTML = '<div class="loading-dates">Загрузка доступных дат...</div>';

    setTimeout(() => {
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

    appState.availableDates.forEach((date) => {
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

    document.querySelectorAll('.date-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.date === date.toISOString().split('T')[0]) {
            btn.classList.add('selected');
        }
    });

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

    weightInputs.forEach(input => {
        const value = parseFloat(input.value);
        if (!isNaN(value) && value > 0) {
            total += value;
        }
    });

    total = Math.round(total * 10) / 10;
    document.getElementById('totalWeight').textContent = `Общий вес: ${total} кг`;

    const submitBtn = document.getElementById('orderSubmitBtn');
    const dateSelected = appState.selectedDate !== null;
    submitBtn.disabled = !dateSelected || total < 35;
}

// Отправка заказа
async function handleOrderSubmit() {
    if (!appState.selectedDate) {
        document.getElementById('orderError').textContent = 'Выберите дату вывоза';
        return;
    }

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
        await new Promise(resolve => setTimeout(resolve, 1000));

        alert('✅ Заказ успешно отправлен!\nНомер: ORD_' + Math.random().toString(36).substr(2, 9).toUpperCase());

        document.querySelectorAll('.weight-input').forEach(input => {
            input.value = '';
        });

        appState.selectedDate = null;
        document.querySelectorAll('.date-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        calculateTotalWeight();
        document.getElementById('orderError').textContent = '';
    } catch (error) {
        document.getElementById('orderError').textContent = 'Ошибка сервера, попробуйте позже';
    } finally {
        submitBtn.textContent = originalText;
        calculateTotalWeight();
    }
}