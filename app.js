let reminders = JSON.parse(localStorage.getItem('med_reminders')) || [];
let voiceEnabled = true;

const form = document.getElementById('reminder-form');
const list = document.getElementById('reminder-list');
const toggleVoiceBtn = document.getElementById('toggle-voice-btn');

// Функция озвучивания голосом
function speak(text) {
  if (!voiceEnabled || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel(); // Остановить предыдущую речь
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ru-RU';
  utterance.rate = 0.9; // Слегка замедленный темп для пожилых людей
  window.speechSynthesis.speak(utterance);
}

// Отрисовка списка
function renderReminders() {
  list.innerHTML = '';
  if (reminders.length === 0) {
    list.innerHTML = '<li><p style="font-size: 1.2rem;">Список напоминаний пуст.</p></li>';
    return;
  }

  reminders.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'reminder-item';
    li.innerHTML = `
      <div class="reminder-info">
        <strong>${item.name}</strong> — в ⏰ ${item.time}
      </div>
      <div>
        <button class="btn-confirm" onclick="confirmTake(${index})">Принято 👍</button>
        <button class="btn-delete" onclick="deleteReminder(${index})">Удалить ❌</button>
      </div>
    `;
    list.appendChild(li);
  });
}

// Сохранение в localStorage
function saveReminders() {
  localStorage.setItem('med_reminders', JSON.stringify(reminders));
  renderReminders();
}

// Добавление новой записи
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('med-name').value;
  const time = document.getElementById('med-time').value;

  reminders.push({ name, time, taken: false });
  saveReminders();
  
  speak(`Добавлено напоминание: ${name} на ${time}`);
  form.reset();
});

// Подтверждение приема
window.confirmTake = function(index) {
  const item = reminders[index];
  speak(`Отлично! Лекарство ${item.name} принято.`);
  alert(`Вы подтвердили прием: ${item.name}`);
};

// Удаление
window.deleteReminder = function(index) {
  const name = reminders[index].name;
  reminders.splice(index, 1);
  saveReminders();
  speak(`Напоминание для ${name} удалено.`);
};

// Переключатель озвучки
toggleVoiceBtn.addEventListener('click', () => {
  voiceEnabled = !voiceEnabled;
  toggleVoiceBtn.textContent = voiceEnabled ? '🔊 Озвучка: Включена' : '🔇 Озвучка: Выключена';
  speak(voiceEnabled ? 'Голосовой помощник включен' : '');
});

// Инициализация
renderReminders();