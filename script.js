// Состояние приложения
let appState = {
    selectedDate: null,
    availableDates: [],
    isAuthenticated: false,
    phoneNumber: '',
    smsCodeStep: false // true - ожидаем ввод SMS кода
};

// База зарегистрированных номеров (временная, для демо)
const registeredPhones = [
    '+79680612062'
];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    optimizeHeight();
    checkAuth();
});

// Проверка авторизации при загрузке
function checkAuth() {
    const savedAuth = localStorage.getItem('orderAppAuth');
    if (savedAuth) {
        try {
            const authData = JSON.parse(savedAuth);
            // Проверяем, не истекла ли сессия (24 часа)
            if (Date.now() - authData.timestamp < 24 * 60 * 60 * 1000) {
                appState.isAuthenticated = true;
                appState.phoneNumber = authData.phone;
                showMainScreen();
                loadAvailableDates(); // Загружаем даты после показа экрана
            } else {
                localStorage.removeItem('orderAppAuth');
                showAuthScreen();
            }
        } catch (e) {
            showAuthScreen();
        }
    } else {
        showAuthScreen();
    }
}

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
    const orderSubmitBtn = document.getElementById('orderSubmitBtn');
    if (orderSubmitBtn) {
        orderSubmitBtn.addEventListener('click', handleOrderSubmit);
    }
    
    // Обработчик авторизации
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    if (authSubmitBtn) {
        authSubmitBtn.addEventListener('click', handleAuth);
    }
    
    // Обработчик выхода
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Маска для телефона
    const phoneInput = document.getElementById('phoneInput');
    if (phoneInput) {
        phoneInput.addEventListener('input', handlePhoneInput);
    }
    
    // Обработчик для SMS кода
    const smsInput = document.getElementById('smsCodeInput');
    if (smsInput) {
        smsInput.addEventListener('input', handleSmsInput);
        smsInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleAuth();
            }
        });
    }
}

// Маска для ввода телефона
function handlePhoneInput(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 0) {
        if (value.startsWith('7')) {
            value = value.substring(1);
        }
        
        let formattedValue = '+7';
        
        if (value.length > 0) {
            formattedValue += ' (' + value.substring(0, 3);
        }
        if (value.length >= 4) {
            formattedValue += ') ' + value.substring(3, 6);
        }
        if (value.length >= 7) {
            formattedValue += '-' + value.substring(6, 8);
        }
        if (value.length >= 9) {
            formattedValue += '-' + value.substring(8, 10);
        }
        
        e.target.value = formattedValue;
    } else {
        e.target.value = '';
    }
    
    // Очищаем ошибки
    const phoneError = document.getElementById('phoneError');
    const authError = document.getElementById('authError');
    if (phoneError) phoneError.textContent = '';
    if (authError) authError.textContent = '';
}

// Обработка ввода SMS кода
function handleSmsInput(e) {
    e.target.value = e.target.value.replace(/\D/g, '').substring(0, 6);
    const smsError = document.getElementById('smsError');
    const authError = document.getElementById('authError');
    if (smsError) smsError.textContent = '';
    if (authError) authError.textContent = '';
}

// Обработка авторизации
async function handleAuth() {
    const phoneInput = document.getElementById('phoneInput');
    const smsCodeGroup = document.getElementById('smsCodeGroup');
    const smsInput = document.getElementById('smsCodeInput');
    const authBtn = document.getElementById('authSubmitBtn');
    const phoneError = document.getElementById('phoneError');
    const smsError = document.getElementById('smsError');
    const authError = document.getElementById('authError');
    
    // Очищаем ошибки
    if (phoneError) phoneError.textContent = '';
    if (smsError) smsError.textContent = '';
    if (authError) authError.textContent = '';
    
    // Шаг 1: Ввод номера телефона
    if (!appState.smsCodeStep) {
        const phone = phoneInput.value.trim();
        
        // Валидация телефона
        if (!phone) {
            if (phoneError) phoneError.textContent = 'Введите номер телефона';
            return;
        }
        
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length !== 11 || !cleanPhone.startsWith('7')) {
            if (phoneError) phoneError.textContent = 'Введите корректный номер телефона';
            return;
        }
        
        const fullPhone = '+' + cleanPhone;
        
        if (authBtn) {
            authBtn.textContent = 'Проверка...';
            authBtn.disabled = true;
        }
        
        try {
            // Имитация запроса к API
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Проверяем, есть ли номер в базе
            if (registeredPhones.includes(fullPhone)) {
                // Номер найден - переходим к вводу SMS кода
                appState.smsCodeStep = true;
                appState.phoneNumber = fullPhone;
                
                // Показываем поле для SMS кода
                if (smsCodeGroup) smsCodeGroup.classList.remove('hidden');
                if (authBtn) authBtn.textContent = 'Подтвердить код';
                
                // Здесь в будущем будет реальная отправка SMS
                console.log('SMS код отправлен на номер:', fullPhone);
                
                // Для демо автоматически заполняем код 123456
                if (smsInput) smsInput.value = '123456';
            } else {
                // Номер не найден
                if (authError) authError.textContent = 'Номер не зарегистрирован в системе';
                appState.smsCodeStep = false;
                if (smsCodeGroup) smsCodeGroup.classList.add('hidden');
            }
        } catch (error) {
            if (authError) authError.textContent = 'Ошибка сервера, попробуйте позже';
        } finally {
            if (authBtn) {
                authBtn.disabled = false;
                if (!appState.smsCodeStep) {
                    authBtn.textContent = 'Продолжить';
                }
            }
        }
    } 
    // Шаг 2: Подтверждение SMS кода
    else {
        const smsCode = smsInput ? smsInput.value.trim() : '';
        
        if (!smsCode || smsCode.length !== 6) {
            if (smsError) smsError.textContent = 'Введите 6-значный код';
            return;
        }
        
        if (authBtn) {
            authBtn.textContent = 'Проверка кода...';
            authBtn.disabled = true;
        }
        
        try {
            // Имитация проверки кода
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Для демо принимаем код 123456
            if (smsCode === '123456') {
                // Успешная авторизация
                appState.isAuthenticated = true;
                
                // Сохраняем в localStorage
                localStorage.setItem('orderAppAuth', JSON.stringify({
                    phone: appState.phoneNumber,
                    timestamp: Date.now()
                }));
                
                // Показываем основной экран
                showMainScreen();
                
                // Загружаем даты
                loadAvailableDates();
            } else {
                if (smsError) smsError.textContent = 'Неверный код подтверждения';
            }
        } catch (error) {
            if (authError) authError.textContent = 'Ошибка проверки кода';
        } finally {
            if (authBtn) {
                authBtn.disabled = false;
                authBtn.textContent = 'Подтвердить код';
            }
        }
    }
}

// Выход из системы
function handleLogout() {
    appState.isAuthenticated = false;
    appState.smsCodeStep = false;
    appState.phoneNumber = '';
    appState.selectedDate = null;
    
    // Очищаем localStorage
    localStorage.removeItem('orderAppAuth');
    
    // Сбрасываем поля
    const phoneInput = document.getElementById('phoneInput');
    const smsInput = document.getElementById('smsCodeInput');
    const smsCodeGroup = document.getElementById('smsCodeGroup');
    const authBtn = document.getElementById('authSubmitBtn');
    
    if (phoneInput) phoneInput.value = '';
    if (smsInput) smsInput.value = '';
    if (smsCodeGroup) smsCodeGroup.classList.add('hidden');
    if (authBtn) authBtn.textContent = 'Продолжить';
    
    // Показываем экран авторизации
    showAuthScreen();
}

// Показать основной экран
function showMainScreen() {
    const authScreen = document.getElementById('authScreen');
    const mainScreen = document.getElementById('mainScreen');
    
    if (authScreen) authScreen.classList.add('hidden');
    if (mainScreen) mainScreen.classList.remove('hidden');
}

// Показать экран авторизации
function showAuthScreen() {
    const authScreen = document.getElementById('authScreen');
    const mainScreen = document.getElementById('mainScreen');
    
    if (authScreen) authScreen.classList.remove('hidden');
    if (mainScreen) mainScreen.classList.add('hidden');
}

// Загрузка доступных дат
function loadAvailableDates() {
    const datesButtons = document.getElementById('datesButtons');
    if (!datesButtons) return;
    
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
    if (!datesButtons) return;
    
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
    
    const orderError = document.getElementById('orderError');
    if (orderError) orderError.textContent = '';
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
    
    const totalWeightEl = document.getElementById('totalWeight');
    if (totalWeightEl) {
        totalWeightEl.textContent = `Общий вес: ${total} кг`;
    }

    const submitBtn = document.getElementById('orderSubmitBtn');
    if (submitBtn) {
        const dateSelected = appState.selectedDate !== null;
        submitBtn.disabled = !dateSelected || total < 35;
    }
}

// Отправка заказа
async function handleOrderSubmit() {
    if (!appState.selectedDate) {
        const orderError = document.getElementById('orderError');
        if (orderError) orderError.textContent = 'Выберите дату вывоза';
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
        const orderError = document.getElementById('orderError');
        if (orderError) orderError.textContent = 'Общий вес должен быть не менее 35 кг';
        return;
    }

    const submitBtn = document.getElementById('orderSubmitBtn');
    if (!submitBtn) return;
    
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
        
        const orderError = document.getElementById('orderError');
        if (orderError) orderError.textContent = '';
    } catch (error) {
        const orderError = document.getElementById('orderError');
        if (orderError) orderError.textContent = 'Ошибка сервера, попробуйте позже';
    } finally {
        submitBtn.textContent = originalText;
        calculateTotalWeight();
    }
}