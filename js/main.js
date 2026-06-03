const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const resetBtn = document.getElementById("reset");
const skipBtn = document.getElementById("skip-btn");
const cardLabel = document.getElementById("card-label");
const timeContent = document.getElementById("timer");
const pageTitle = document.getElementById("page-title");
const Card = document.getElementById("pomodoro-card");
const decorImages = document.querySelectorAll(".decor-img");

window.addEventListener("scroll", () => {
  requestAnimationFrame(() => {
    const scrollY = window.scrollY;
    decorImages.forEach((img, index) => {
      const factor = (index + 1) * 0.02;
      const y = Math.sin(scrollY * factor) * 15;
      const x = Math.cos(scrollY * factor * 0.8) * 10;
      img.style.transform = `translate(${x}px, ${y}px)`;
    });
  });
});

Card.addEventListener("mousemove", (e) => {
  const rect = Card.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;
  let rotateY = (x / rect.width - 0.5) * 20;
  let rotateX = (y / rect.height - 0.5) * 20;
  Card.style.transform = `rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`;
});
Card.addEventListener("mouseleave", () => {
  Card.style.transform = "rotateX(0deg) rotateY(0deg)";
});
let timerId = null;
let isBreak = false;
let tomatoCount = 0;
let duration = 25 * 60; // seconds
let endTime = null; // пустая переменная конечного времени
let isRunning = false; // то что таймер тикает состояние false
let timeOutId = null;
function runTimer() {
  // функция запуска таймера
  timerId = setInterval(() => {
    // запуск интервала, с частотой каждые 300мс
    let remainingMs = endTime - Date.now(); // считаем оставшиеся милисекунды вычитаем из конечного время колво милисекунд сейчас
    let remainingSeconds = Math.floor(remainingMs / 1000); // переводим милисекунды в секунды методом Math.floor(./1000)
    updateTime(remainingSeconds); // выводим на экран оставшиеся секунды
    if (remainingSeconds <= 0) {
      // если время вышло то
      clearInterval(timerId);
      timerId = null;
      isRunning = false;
      if (timeOutId !== null) {
        return;
      } else {
        timeOutId = setTimeout(() => {
          // останавливаем таймер
          switchMode();
          saveState();
          timeOutId = null; // меняем режим
        }, 1000);
      }
    }
  }, 300);
}
function saveState() {
  // функция сохранения состояния
  const state = {
    // создаем объект со всеми переменными
    endTime: isRunning ? endTime : null, // если таймер идёт то записываем endTime, иначе пустоту, как и в начале
    isBreak,
    tomatoCount,
    duration,
    isRunning,
  };
  localStorage.setItem("pomodoro", JSON.stringify(state)); // отправляем в localStorage через метод setItem наш объект, с помощью stringify
}

function restoreState() {
  // функция для восстановления данных
  const saved = localStorage.getItem("pomodoro"); // достаем данные из хранилища
  if (!saved) {
    // если их нет то значит ставим дефолтное время таймера
    updateTime(duration);
    return;
  } else {
    // иначе парсим все данные из saved
    const state = JSON.parse(saved);
    isBreak = state.isBreak;
    tomatoCount = state.tomatoCount;
    duration = state.duration;
    endTime = state.endTime;
    isRunning = state.isRunning; //восстанавливаем все переменные из state
    if (isBreak) {
      if (tomatoCount < 3) {
        // если перерыв то меняем текст
        cardLabel.textContent = `Пора сделать перерыв!`;
        document.body.classList.add("is-break");
      } else {
        cardLabel.textContent = `Пора сделать длинный перерыв!`;
        document.body.classList.add("is-long-break");
      }
    } else {
      // иначе пора за работу
      cardLabel.textContent = `Пора за работу!`;
      document.body.classList.remove("is-break");
      document.body.classList.remove("is-long-break");
    }
    if (isRunning) {
      //если таймер работает то считаем оставшиеся миллисекунды
      const remainingMs = endTime - Date.now();
      if (remainingMs > 0) {
        // если таймер не истёк то выводим оставшееся время в секундах, запускаем таймер
        const remainingSeconds = Math.floor(remainingMs / 1000);
        updateTime(remainingSeconds);
        runTimer();
      } else {
        // иначе если время вышло то меняем режим, останавливаем isRunning, ставим обычное время, сохраняем состояние в хранилище
        switchMode();
        isRunning = false;
        updateTime(duration);
        saveState();
      }
    }
  }
}

function switchMode() {
  isBreak = !isBreak;
  if (isBreak) {
    tomatoCount++;
    if (tomatoCount < 3) {
      cardLabel.textContent = `Пора сделать перерыв!`;
      document.body.classList.add("is-break");
      duration = 5 * 60;
    } else {
      cardLabel.textContent = `Пора сделать длинный перерыв!`;
      document.body.classList.add("is-long-break");
      duration = 20 * 60;
      tomatoCount = 0;
    }
  } else {
    cardLabel.textContent = `Пора за работу!`;
    document.body.classList.remove("is-break");
    document.body.classList.remove("is-long-break");
    duration = 25 * 60;
  }
  updateTime(duration);
}
function updateTime(secs) {
  let minutes = Math.floor(secs / 60);
  let seconds = secs % 60;
  let timeOutput = `${minutes}:${seconds < 10 ? `0` + seconds : seconds}`;
  timeContent.textContent = timeOutput;
  pageTitle.textContent = timeOutput;
}
function startTimer() {
  endTime = Date.now() + duration * 1000; // по нажатию кнопки start считаем конечное время в милискундах
  isRunning = true; // меняем состояние
  saveState(); // сохраняем конпчное время и состояние в хранилище
  runTimer(); // запускаем таймер
}
startBtn.addEventListener("click", () => {
  startTimer();
});
stopBtn.addEventListener("click", () => {
  clearInterval(timerId);
  timerId = null;
  isRunning = false;
  clearTimeout(timeOutId);
  timeOutId = null;
  saveState(); // также сохраняем состояние isRunning
});
resetBtn.addEventListener("click", () => {
  clearInterval(timerId);
  timerId = null;
  clearTimeout(timeOutId);
  timeOutId = null;
  tomatoCount = 0;
  isBreak = false;
  duration = 25 * 60;
  cardLabel.textContent = `Пора за работу!`;
  document.body.classList.remove("is-break", "is-long-break");
  updateTime(duration);
  isRunning = false;
  saveState(); // возвращаем всё в начальное состояние и сохраняем в хранилище
});
skipBtn.addEventListener("click", () => {
  clearInterval(timerId);
  timerId = null;
  clearTimeout(timeOutId);
  timeOutId = null;
  isRunning = false;
  switchMode();
  saveState();
});
document.addEventListener("DOMContentLoaded", restoreState); // при загрузке страницы запускаем функцию которая проверяет есть ли данные в хранилище и восстанавливает их в случае если они есть а иначе просто выставляет начальные 25 минут
