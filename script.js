// Состояние приложения
let appState = {
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
        input.addEventListener('input', calculateTotalWeight);
        // Добавляем поддержку enter для удобства
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                calculateTotalWeight();
            }
        });
    });
    
    // Обработчик отправки заказа
    document.getElementById('orderSubmitBtn').addEventListener('click', handleOrderSubmit);
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
    let totalWeight = 0;
    
    document.querySelectorAll('.weight-input').forEach(input => {
        const weight = parseFloat(input.value) || 0;
        products[input.dataset.product] = weight;
        totalWeight += weight;
    });
    
    // Проверка минимального веса (на всякий случай)
    if (totalWeight < 35) {
        document.getElementById('orderError').textContent = 'Общий вес должен быть не менее 35 кг';
        return;
    }
    
    // Показываем индикатор загрузки на кнопке
    const submitBtn = document.getElementById('orderSubmitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Отправка...';
    submitBtn.disabled = true;
    
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
            document.getElementById('orderError').textContent = '';
        } else {
            document.getElementById('orderError').textContent = 'Ошибка при отправке заказа';
        }
    } catch (error) {
        document.getElementById('orderError').textContent = 'Ошибка сервера, попробуйте позже';
    } finally {
        // Возвращаем кнопку в исходное состояние
        submitBtn.textContent = originalText;
        submitBtn.disabled = totalWeight < 35;
    }
}

// Имитация серверного запроса
function mockServerRequest(endpoint, data) {
    return new Promise((resolve) => {
        setTimeout(() => {
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
    if (confirm('Сбросить все значения?')) {
        document.querySelectorAll('.weight-input').forEach(input => {
            input.value = '0';
        });
        document.getElementById('dateSelect').value = '';
        calculateTotalWeight();
        document.getElementById('orderError').textContent = '';
    }
}

// Добавляем скрытую функцию сброса (можно вызвать из консоли)
window.resetForm = resetAllFields;