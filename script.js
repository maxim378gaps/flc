const translations = {
    ru: {
        get_signal: "СИГНАЛ",
        menu: "МЕНЮ",
        press_signal: "Нажмите кнопку СИГНАЛ",
        scanning: "Получаем сигнал...",
        heads: "Орёл",
        tails: "Решка",
        probability: "Шанс выпадения:",
        new_session: "Начать новую сессию?",
        start: "Начать",
        cancel: "МЕНЮ",
        instruction: "📖 Инструкция",
        instruction_title: "📖 Инструкция",
        instruction_text: "Если вы забрали выигрыш раньше, завершите текущую сессию. Для этого пропустите оставшиеся сигналы, дождитесь окончания 7 игр и нажмите кнопку 'Начать' в уведомлении.",
    },
    en: {
        get_signal: "SIGNAL",
        menu: "MENU",
        press_signal: "Press the SIGNAL button",
        scanning: "Getting signal...",
        heads: "Heads",
        tails: "Tails",
        probability: "Probability:",
        new_session: "Start a new session?",
        start: "Start",
        cancel: "MENU",
        instruction: "📖 Instruction",
        instruction_title: "📖 Instruction",
        instruction_text: "If you took the winnings earlier, close the signal session. To do this, skip the remaining signals, wait for the end of 7 games, and click 'Start' in the notification.",
    },
    in: {
        get_signal: "संकेत",
        menu: "मेनू",
        press_signal: "सिग्नल बटन दबाएं",
        scanning: "सिग्नल प्राप्त कर रहे हैं...",
        heads: "हेड",
        tails: "टेल",
        probability: "संभावना:",
        new_session: "नया सत्र शुरू करें?",
        start: "शुरू करें",
        cancel: "मेनू",
        instruction: "📖 निर्देश",
        instruction_title: "📖 निर्देश",
        instruction_text: "यदि आपने पहले जीत ली है, तो सिग्नल सत्र बंद करें। ऐसा करने के लिए, शेष सिग्नल को छोड़ दें, 7 गेम के अंत तक प्रतीक्षा करें और अधिसूचना में 'शुरू करें' पर क्लिक करें।",
    },
};

let currentLang = 'ru';
let isTimerRunning = false;
let timerStartTime = null;
const timerDuration = 7000; // 7 секунд
let lastResults = []; // Массив для хранения последних результатов
let history = []; // Массив для хранения истории выпадений

function setLanguage(lang) {
    currentLang = lang;
    document.getElementById('flag-icon').src = `https://flagcdn.com/${lang === 'ru' ? 'ru' : lang === 'en' ? 'us' : 'in'}.svg`;
    document.getElementById('language-text').textContent = `${lang.toUpperCase()} ▼`;
    document.querySelectorAll('[data-key]').forEach(element => {
        const key = element.getAttribute('data-key');
        element.textContent = translations[lang][key];
    });

    // Обновляем текст в окне рендера
    const scanText = document.getElementById('scan-text');
    if (scanText.textContent === translations['ru'].press_signal || scanText.textContent === translations['en'].press_signal || scanText.textContent === translations['in'].press_signal) {
        scanText.textContent = translations[lang].press_signal;
    }

    // Обновляем текст инструкции
    document.getElementById('instruction-title').textContent = translations[lang].instruction_title;
    document.getElementById('instruction-text').textContent = translations[lang].instruction_text;

    toggleLanguageDropdown();
}

function toggleLanguageDropdown() {
    const dropdown = document.getElementById('language-dropdown');
    dropdown.classList.toggle('active');
}

function getRandomResult() {
    let randomResult;

    // Если в последних 10 результатах больше 9 "Орлов" или "Решек", выбираем противоположное
    if (lastResults.filter(result => result === 0).length >= 10) {
        randomResult = 1; // Выбираем "Решку"
    } else if (lastResults.filter(result => result === 1).length >= 10) {
        randomResult = 0; // Выбираем "Орла"
    } else {
        randomResult = Math.random() < 0.5 ? 0 : 1; // Случайный выбор
    }

    // Добавляем результат в массив
    lastResults.push(randomResult);

    // Ограничиваем массив последних 10 результатов
    if (lastResults.length > 10) {
        lastResults.shift();
    }

    return randomResult;
}

function getProbability(step) {
    switch (step) {
        case 1:
        case 2:
        case 3:
            return (Math.random() * 6 + 92).toFixed(2); // 92.00–98.00%
        case 4:
            return (Math.random() * 5 + 68).toFixed(2); // 68.00–73.00%
        case 5:
            return (Math.random() * 9 + 54).toFixed(2); // 54.00–63.00%
        case 6:
            return (Math.random() * 11 + 30).toFixed(2); // 30.00–41.00%
        case 7:
            return (Math.random() * 10 + 13).toFixed(2); // 13.00–23.00%
        default:
            return "100.00";
    }
}

function updateHistory(result) {
    history.push(result);

    // Если история достигла 7 элементов, показываем уведомление
    if (history.length >= 7) {
        setTimeout(() => {
            showNotification();
        }, 2000); // Задержка 2 секунды перед показом уведомления
    }

    // Обновляем отображение истории
    const historyCircles = document.querySelectorAll('.history-circle');
    historyCircles.forEach((circle, index) => {
        if (index < history.length) {
            circle.classList.add('filled');
            circle.classList.add(history[index] === 0 ? 'heads' : 'tails');
        } else {
            circle.classList.remove('filled', 'heads', 'tails');
        }
    });
}

function showNotification() {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    const startNewSessionButton = document.getElementById('start-new-session');
    const cancelNewSessionButton = document.getElementById('cancel-new-session');

    notificationText.textContent = translations[currentLang].new_session;
    startNewSessionButton.textContent = translations[currentLang].start;
    cancelNewSessionButton.textContent = translations[currentLang].cancel;

    notification.style.display = 'block';

    // Блокируем все кнопки
    document.getElementById('signal-button').disabled = true;
    document.getElementById('language-button').disabled = true;
    document.getElementById('instruction-button').disabled = true;
}

function resetSession() {
    history = [];
    const historyCircles = document.querySelectorAll('.history-circle');
    historyCircles.forEach(circle => {
        circle.classList.remove('filled', 'heads', 'tails');
    });

    const notification = document.getElementById('notification');
    notification.style.display = 'none';

    // Разблокируем все кнопки
    document.getElementById('signal-button').disabled = false;
    document.getElementById('language-button').disabled = false;
    document.getElementById('instruction-button').disabled = false;
}

function startScanner() {
    if (isTimerRunning) return;

    const scanner = document.getElementById('scanner');
    const scanText = document.getElementById('scan-text');
    const result = document.getElementById('result');
    const outcome = document.getElementById('outcome');
    const probability = document.getElementById('probability');
    const signalButton = document.getElementById('signal-button');
    const timerFill = document.getElementById('timer-fill');

    // Сбрасываем состояние
    scanner.style.display = 'block';
    result.style.display = 'none';
    scanText.textContent = translations[currentLang].scanning;
    signalButton.disabled = true;
    isTimerRunning = true;
    timerStartTime = Date.now();

    // Сохраняем время начала таймера в localStorage
    localStorage.setItem('timerStartTime', timerStartTime);

    // Генерация случайного результата
    const randomResult = getRandomResult();

    // Генерация случайного шанса в зависимости от шага
    const step = history.length + 1;
    const randomProbability = getProbability(step);

    // Показываем результат через 3 секунды
    setTimeout(() => {
        scanner.style.display = 'none';
        result.style.display = 'block';
        outcome.textContent = randomResult === 0 ? translations[currentLang].heads : translations[currentLang].tails;
        outcome.className = `outcome ${randomResult === 0 ? 'heads' : 'tails'}`; // Добавляем класс для цвета
        probability.textContent = `${translations[currentLang].probability} ${randomProbability}%`;

        // Обновляем историю
        updateHistory(randomResult);

        // Через 3-4 секунды снова показываем "Нажмите кнопку СИГНАЛ"
        setTimeout(() => {
            result.style.display = 'none';
            scanner.style.display = 'block';
            scanText.textContent = translations[currentLang].press_signal;
        }, 3000);
    }, 3000);

    // Запуск таймера
    updateTimer();
}

function updateTimer() {
    const timerFill = document.getElementById('timer-fill');
    const signalButton = document.getElementById('signal-button');
    const elapsedTime = Date.now() - timerStartTime;
    const remainingTime = Math.max(0, timerDuration - elapsedTime);

    // Обновляем заполнение кнопки
    const fillPercentage = ((timerDuration - remainingTime) / timerDuration) * 100;
    timerFill.style.width = `${fillPercentage}%`;

    if (remainingTime > 0) {
        requestAnimationFrame(updateTimer);
    } else {
        signalButton.disabled = false;
        isTimerRunning = false;
        localStorage.removeItem('timerStartTime'); // Удаляем запись из localStorage
    }
}

function checkTimerOnLoad() {
    const savedStartTime = localStorage.getItem('timerStartTime');
    if (savedStartTime) {
        const elapsedTime = Date.now() - parseInt(savedStartTime, 10);
        if (elapsedTime < timerDuration) {
            isTimerRunning = true;
            timerStartTime = parseInt(savedStartTime, 10);
            document.getElementById('signal-button').disabled = true;
            updateTimer();
        } else {
            localStorage.removeItem('timerStartTime');
        }
    }
}

function createStars() {
    const starsContainer = document.getElementById('stars-container');
    const starCount = 100;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.width = `${Math.random() * 3}px`;
        star.style.height = star.style.width;
        star.style.backgroundColor = `rgba(255, 255, 255, ${Math.random()})`;
        star.style.animationDelay = `${Math.random() * 2}s`;
        starsContainer.appendChild(star);
    }
}

function showAlert() {
    const alert = document.getElementById('alert');
    alert.style.display = 'block';
    setTimeout(() => {
        alert.style.animation = 'fadeOut 0.5s ease-out'; // Плавное исчезновение
        setTimeout(() => {
            alert.style.display = 'none';
        }, 500); // Ждем завершения анимации
    }, 2500); // Скрываем через 2.5 секунды
}

document.addEventListener('DOMContentLoaded', () => {
    setLanguage(currentLang);
    createStars();
    document.getElementById('language-dropdown').classList.remove('active');
    checkTimerOnLoad();
    showAlert(); // Показываем всплывающее окно

    // Обработчик для кнопки "Начать" в уведомлении
    document.getElementById('start-new-session').addEventListener('click', resetSession);

    // Обработчик для кнопки "Отмена" в уведомлении
    document.getElementById('cancel-new-session').addEventListener('click', () => {
        window.location.href = 'menu.html';
    });

    // Обработчик для кнопки "Инструкция"
    document.getElementById('instruction-button').addEventListener('click', () => {
        const modal = document.getElementById('instruction-modal');
        modal.style.display = 'block';
    });

    // Обработчик для закрытия модального окна
    document.getElementById('close-modal').addEventListener('click', () => {
        const modal = document.getElementById('instruction-modal');
        modal.style.display = 'none';
    });

    // Устанавливаем начальный текст
    document.getElementById('scan-text').textContent = translations[currentLang].press_signal;
});