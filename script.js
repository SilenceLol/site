// Состояние приложения
let appState = {
    phoneNumber: '',
    smsCode: '',
    accessCode: null,
    availableDates: []
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    loadAvailableDates();
    checkExistingSession();
});

// Инициализация обработчиков событий
function initApp() {
    // Шаг 1 - телефон
    const phoneInput = document.getElementById('phoneInput');
    const phoneSubmitBtn = document.getElementById('phoneSubmitBtn');
    
    phoneInput.addEventListener('input', handlePhoneInput);
    phoneSubmitBtn.addEventListener('click', handlePhoneSubmit);

    // Шаг 2 - SMS код
    const smsCodeInput = document.getElementById('smsCodeInput');
    const smsSubmitBtn = document.getElementById('smsSubmitBtn');
    const backToPhoneBtn = document.getElementById('backToPhoneBtn');
    
    smsCodeInput.addEventListener('input', handleSmsCodeInput);
    smsSubmitBtn.addEventListener('click', handleSmsSubmit);
    backToPhoneBtn.addEventListener('click', goToStep1);

    // Шаг 3 - заказ
    const weightInputs = document.querySelectorAll('.weight-input');
    weightInputs.forEach(input => {
        input.addEventListener('input', calculateTotalWeight);
    });
    
    document.getElementById('orderSubmitBtn').addEventListener('click', handleOrderSubmit);
}

// Проверка существующей сессии (код доступа в кэше)
function checkExistingSession() {
    const cachedAccessCode = sessionStorage.getItem('accessCode');
    if (cachedAccessCode) {
        appState.accessCode = cachedAccessCode;
        goToStep3();
    }
}

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
}

// Обработка ввода телефона
function handlePhoneInput(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    e.target.value = value;
    
    document.getElementById('phoneError').textContent = '';
}

// Отправка номера телефона на сервер
async function handlePhoneSubmit() {
    const phoneInput = document.getElementById('phoneInput');
    const phone = phoneInput.value;
    
    if (phone.length !== 10) {
        document.getElementById('phoneError').textContent = 'Введите 10 цифр номера';
        return;
    }

    const fullPhone = '+7' + phone;
    appState.phoneNumber = fullPhone;

    try {
        // Имитация POST запроса к серверу
        const response = await mockServerRequest('/check-phone', { phone: fullPhone });
        
        if (response.exists) {
            // Номер есть в базе, переходим к вводу SMS
            goToStep2();
            // Здесь реальный сервер отправит SMS
            console.log('SMS отправлен на номер', fullPhone);
        } else {
            document.getElementById('phoneError').textContent = 'Номер не найден в системе';
        }
    } catch (error) {
        document.getElementById('phoneError').textContent = 'Ошибка сервера, попробуйте позже';
    }
}

// Обработка ввода SMS кода
function handleSmsCodeInput(e) {
    const code = e.target.value.replace(/\D/g, '');
    e.target.value = code;
    
    const submitBtn = document.getElementById('smsSubmitBtn');
    submitBtn.disabled = code.length !== 6;
    
    document.getElementById('smsError').textContent = '';
}

// Отправка SMS кода на сервер
async function handleSmsSubmit() {
    const smsCode = document.getElementById('smsCodeInput').value;
    
    if (smsCode.length !== 6) return;

    try {
        // Имитация POST запроса с номером и кодом
        const response = await mockServerRequest('/verify-code', {
            phone: appState.phoneNumber,
            code: smsCode
        });
        
        if (response.valid) {
            // Сохраняем код доступа в sessionStorage (кэш)
            appState.accessCode = response.accessCode;
            sessionStorage.setItem('accessCode', response.accessCode);
            
            // Переходим к выбору даты и продукции
            goToStep3();
        } else {
            document.getElementById('smsError').textContent = 'Неверный код подтверждения';
        }
    } catch (error) {
        document.getElementById('smsError').textContent = 'Ошибка сервера, попробуйте позже';
    }
}

// Переход к шагу 1
function goToStep1() {
    document.getElementById('step1').classList.add('active');
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step3').classList.remove('active');
    
    // Очищаем поля
    document.getElementById('smsCodeInput').value = '';
    document.getElementById('smsSubmitBtn').disabled = true;
}

// Переход к шагу 2
function goToStep2() {
    document.getElementById('step1').classList.remove('active');
    document.getElementById('step2').classList.add('active');
    document.getElementById('step3').classList.remove('active');
}

// Переход к шагу 3
function goToStep3() {
    document.getElementById('step1').classList.remove('active');
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step3').classList.add('active');
}

// Расчет общего веса
function calculateTotalWeight() {
    const weightInputs = document.querySelectorAll('.weight-input');
    let total = 0;
    
    weightInputs.forEach(input => {
        total += parseFloat(input.value) || 0;
    });
    
    // Округляем до 1 знака после запятой
    total = Math.round(total * 10) / 10;
    
    document.getElementById('totalWeight').textContent = `Общий вес: ${total} кг`;
    
    // Активируем/деактивируем кнопку отправки
    const submitBtn = document.getElementById('orderSubmitBtn');
    submitBtn.disabled = total < 35;
}

// Отправка заказа
async function handleOrderSubmit() {
    const date = document.getElementById('dateSelect').value;
    
    if (!date) {
        document.getElementById('orderError').textContent = 'Выберите дату вывоза';
        return;
    }
    
    // Собираем данные о продукции
    const products = {};
    document.querySelectorAll('.weight-input').forEach(input => {
        products[input.dataset.product] = parseFloat(input.value) || 0;
    });
    
    const totalWeight = Object.values(products).reduce((a, b) => a + b, 0);
    
    try {
        // Имитация отправки заказа
        const response = await mockServerRequest('/submit-order', {
            accessCode: appState.accessCode,
            date: date,
            products: products,
            totalWeight: totalWeight
        });
        
        if (response.success) {
            alert('Заказ успешно отправлен!');
            // Очищаем поля веса
            document.querySelectorAll('.weight-input').forEach(input => {
                input.value = '0';
            });
            calculateTotalWeight();
        } else {
            document.getElementById('orderError').textContent = 'Ошибка при отправке заказа';
        }
    } catch (error) {
        document.getElementById('orderError').textContent = 'Ошибка сервера, попробуйте позже';
    }
}

// Имитация серверных запросов
function mockServerRequest(endpoint, data) {
    return new Promise((resolve) => {
        setTimeout(() => {
            switch(endpoint) {
                case '/check-phone':
                    // Имитация проверки номера в базе
                    // Для теста: все номера кроме 0000000000 считаем существующими
                    const phoneExists = data.phone !== '+70000000000';
                    resolve({ exists: phoneExists });
                    break;
                    
                case '/verify-code':
                    // Имитация проверки кода
                    // Для теста: правильный код - 123456
                    const isValid = data.code === '123456';
                    resolve({ 
                        valid: isValid, 
                        accessCode: isValid ? 'ACCESS_' + Math.random().toString(36).substr(2, 9) : null 
                    });
                    break;
                    
                case '/submit-order':
                    // Имитация успешной отправки заказа
                    resolve({ success: true });
                    break;
                    
                default:
                    resolve({});
            }
        }, 800); // Имитация задержки сети
    });
}