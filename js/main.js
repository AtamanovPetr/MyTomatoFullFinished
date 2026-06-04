const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const resetBtn = document.getElementById("reset");
const skipBtn = document.getElementById("skip-btn");
const cardLabel = document.getElementById("card-label");
const timeContent = document.getElementById("timer");
const pageTitle = document.getElementById("page-title");
const openModal = document.getElementById("open-modal");
const modalBlock = document.getElementById("modal");
const modalOverlay = document.getElementById("overlay");
const exitBtn = document.getElementById("exitbtn");
const Card = document.getElementById("pomodoro-card");
const decorImages = document.querySelectorAll(".decor-img");

let timerId = null;
let endTime = null;
let duration = 25 * 60;
let isBreak = false;
let isRunning = false;
let timeOutId = null;
let tomatoCount = 0;
function saveState() {
  let state = {
    isBreak,
    isRunning,
    endTime: isRunning ? endTime : null,
    duration,
    tomatoCount,
  };
  localStorage.setItem("pomodoro", JSON.stringify(state));
}
function restoreState() {
  let saved = localStorage.getItem("pomodoro");
  if (!saved) {
    updateTime(duration);
  } else {
    const state = JSON.parse(saved);
    endTime = state.endTime;
    isRunning = state.isRunning;
    tomatoCount = state.tomatoCount;
    duration = state.duration;
    isBreak = state.isBreak;
    if (isRunning) {
      let remainingMs = endTime - Date.now();
      let remainingSeconds = Math.floor(remainingMs / 1000);
      if (remainingSeconds > 0) {
        updateTime(remainingSeconds);
        runTimer();
      } else {
        swithMode();
        saveState();
      }
    } else {
      if (isBreak) {
        if (tomatoCount < 3) {
          cardLabel.textContent = `Пора сделать перерыв!`;
          document.body.classList.remove("is-break", "is-long-break");
          document.body.classList.add("is-break");
        } else {
          cardLabel.textContent = `Пора сделать длинный перерыв!`;
          document.body.classList.remove("is-break", "is-long-break");
          document.body.classList.add("is-long-break");
        }
      } else {
        cardLabel.textContent = `Пора за работу!`;
        document.body.classList.remove("is-break", "is-long-break");
      }
      updateTime(duration);
    }
  }
}

function swithMode() {
  isBreak = !isBreak;
  if (isBreak) {
    tomatoCount++;
    if (tomatoCount < 3) {
      cardLabel.textContent = `Пора сделать перерыв!`;
      document.body.classList.remove("is-break", "is-long-break");
      document.body.classList.add("is-break");
      duration = 5 * 60;
    } else {
      cardLabel.textContent = `Пора сделать длинный перерыв!`;
      document.body.classList.remove("is-break", "is-long-break");
      document.body.classList.add("is-long-break");
      duration = 20 * 60;
      tomatoCount = 0;
    }
  } else {
    duration = 25 * 60;
    cardLabel.textContent = `Пора за работу!`;
    document.body.classList.remove("is-break", "is-long-break");
  }
  updateTime(duration);
}

function runTimer() {
  if (timerId !== null) {
    return;
  }
  timerId = setInterval(() => {
    let remainingMs = endTime - Date.now();
    let remainingSeconds = Math.floor(remainingMs / 1000);
    updateTime(remainingSeconds);
    if (remainingSeconds <= 0) {
      clearInterval(timerId);
      timerId = null;
      isRunning = false;
      if (timeOutId !== null) return;
      updateTime(0);
      timeOutId = setTimeout(() => {
        timeOutId = null;
        swithMode();
        saveState();
      }, 1000);
    }
  }, 300);
}

function updateTime(secs) {
  let minutes = Math.floor(secs / 60);
  let seconds = secs % 60;
  let timeOutput = `${minutes}:${seconds < 10 ? `0` + seconds : seconds}`;
  timeContent.textContent = timeOutput;
  pageTitle.textContent = timeOutput;
}
function startTimer() {
  clearTimeout(timeOutId);
  timeOutId = null;
  endTime = Date.now() + duration * 1000;
  isRunning = true;
  saveState();
  runTimer();
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
  saveState();
});
resetBtn.addEventListener("click", () => {
  isBreak = false;
  isRunning = false;
  clearInterval(timerId);
  timerId = null;
  clearTimeout(timeOutId);
  timeOutId = null;
  duration = 25 * 60;
  cardLabel.textContent = `Пора за работу!`;
  document.body.classList.remove("is-break", "is-long-break");
  tomatoCount = 0;
  updateTime(duration);
  saveState();
});
skipBtn.addEventListener("click", () => {
  isRunning = false;
  clearInterval(timerId);
  timerId = null;
  clearTimeout(timeOutId);
  timeOutId = null;
  swithMode();
  saveState();
});

function openModalWindow() {
  document.body.style = "overflow: hidden";
  modalBlock.classList.add("is-open");
  modalOverlay.classList.add("is-open-overlay");
}

function closeModal() {
  document.activeElement.blur();
  document.body.style = "";
  modalBlock.classList.remove("is-open");
  modalOverlay.classList.remove("is-open-overlay");
}

openModal.addEventListener("click", () => {
  openModalWindow();
});
exitBtn.addEventListener("click", () => {
  closeModal();
});
modalOverlay.addEventListener("click", () => {
  closeModal();
});
modalBlock.addEventListener("click", (e) => {
  e.stopPropagation();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalBlock.classList.contains("is-open")) {
    closeModal();
  } else {
    return;
  }
});

document.addEventListener("DOMContentLoaded", restoreState);

window.addEventListener("scroll", () => {
  requestAnimationFrame(() => {
    const scrollY = window.scrollY;
    decorImages.forEach((img, index) => {
      const factor = (index + 1) * 0.02;
      const y = Math.sin(scrollY * factor) * 10;
      const x = Math.cos(scrollY * factor * 0.8) * 1;
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
