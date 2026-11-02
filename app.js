// MedReminder AI - Core Application Logic with Web Audio API & Timers

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('med-form');
  const nameInput = document.getElementById('med-name');
  const timeInput = document.getElementById('med-time');
  const dosageInput = document.getElementById('med-dosage');
  const medList = document.getElementById('med-list');
  const totalCountEl = document.getElementById('total-count');
  const completedCountEl = document.getElementById('completed-count');

  let reminders = JSON.parse(localStorage.getItem('medReminders')) || [];

  // Инициализация Web Audio API для звуковых сигналов
  function playBeep(type = 'success') {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      } else {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
      }

      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.log('Web Audio API not supported or blocked');
    }
  }

  // Голосовое сопровождение
  function speak(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ru-RU';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }

  // Функция расчета оставшегося времени
  function getTimeRemaining(targetTimeStr) {
    const now = new Date();
    const [hours, minutes] = targetTimeStr.split(':').map(Number);
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);

    if (target < now) {
      target.setDate(target.getDate() + 1); // Перенос на завтра, если время прошло
    }

    const diffMs = target - now;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;

    if (h > 0) {
      return `${h} ч. ${m} мин.`;
    }
    return `${m} мин.`;
  }

  // Обновление статистики
  function updateStats() {
    totalCountEl.textContent = reminders.length;
    const completed = reminders.filter(r => r.taken).length;
    completedCountEl.textContent = completed;
  }

  // Рендер списка
  function renderReminders() {
    medList.innerHTML = '';

    if (reminders.length === 0) {
      medList.innerHTML = '<p class="empty-state">Список лекарств пуст. Добавьте первое напоминание выше!</p>';
      updateStats();
      return;
    }

    reminders.forEach((med, index) => {
      const card = document.createElement('div');
      card.className = `med-card ${med.taken ? 'taken' : ''}`;

      const timeLeft = med.taken ? 'Принято' : `До приема: ${getTimeRemaining(med.time)}`;

      card.innerHTML = `
        <div class="med-info">
          <h3>${med.name}</h3>
          <p class="med-time">⏰ Время: <strong>${med.time}</strong> <span class="badge">${timeLeft}</span></p>
          ${med.dosage ? `<p class="med-dosage">📝 Дозировка: ${med.dosage}</p>` : ''}
        </div>
        <div class="med-actions">
          <button class="btn btn-done" onclick="toggleDone(${index})">
            ${med.taken ? '✓ Принято' : 'Отметить прием'}
          </button>
          <button class="btn btn-delete" onclick="deleteMed(${index})" aria-label="Удалить ${med.name}">
            🗑️
          </button>
        </div>
      `;

      medList.appendChild(card);
    });

    updateStats();
  }

  // Сохранение в localStorage
  function saveReminders() {
    localStorage.setItem('medReminders', JSON.stringify(reminders));
    renderReminders();
  }

  // Добавление напоминания
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const newMed = {
      name: nameInput.value.trim(),
      time: timeInput.value,
      dosage: dosageInput.value.trim(),
      taken: false,
      createdAt: new Date().toISOString()
    };

    reminders.push(newMed);
    saveReminders();

    playBeep('success');
    speak(`Добавлено лекарство ${newMed.name} на ${newMed.time}`);

    form.reset();
  });

  // Отметка приема
  window.toggleDone = (index) => {
    reminders[index].taken = !reminders[index].taken;
    saveReminders();

    if (reminders[index].taken) {
      playBeep('success');
      speak(`Прием лекарства ${reminders[index].name} подтвержден`);
    }
  };

  // Удаление
  window.deleteMed = (index) => {
    const deletedName = reminders[index].name;
    reminders.splice(index, 1);
    saveReminders();

    playBeep('delete');
    speak(`Удалено лекарство ${deletedName}`);
  };

  // Первичный рендер
  renderReminders();
});