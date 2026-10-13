// Шаблон мәліметтерін толтыру
function applyPreset(name, grade, duration) {
  document.getElementById('eventName').value = name;
  document.getElementById('grade').value = grade;
  document.getElementById('duration').value = duration;
}

// Демо режим үшін кілт енгізу
function fillDemoKey() {
  document.getElementById('apiKey').value = "DEMO_KEY";
  alert("Демо-режим белсендірілді! Тесттік генерация орындалады.");
}

// Табтарды ауыстыру
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

  event.target.classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

// Текст көшіру
function copyContent(elementId) {
  const text = document.getElementById(elementId).innerText;
  navigator.clipboard.writeText(text).then(() => {
    alert("Мәтін көшіріп алынды!");
  });
}

// Негізгі генерация функциясы
async function generateAll() {
  const apiKey = document.getElementById('apiKey').value.trim();
  const eventName = document.getElementById('eventName').value.trim();
  const grade = document.getElementById('grade').value.trim();
  const duration = document.getElementById('duration').value.trim();

  if (!apiKey || !eventName) {
    alert("Өтініш, барлық міндетті өрістерді толтырыңыз!");
    return;
  }

  const btnText = document.querySelector('.btn-text');
  const btnLoader = document.querySelector('.btn-loader');
  const resultsSection = document.getElementById('resultsSection');

  btnText.classList.add('hidden');
  btnLoader.classList.remove('hidden');

  // Демо режимді тексеру
  if (apiKey === "DEMO_KEY") {
    setTimeout(() => {
      renderDemoData(eventName, grade, duration);
      btnText.classList.remove('hidden');
      btnLoader.classList.add('hidden');
      resultsSection.classList.remove('hidden');
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }, 1500);
    return;
  }

  try {
    // AI Сұраныстары
    const scenarioPrompt = `Мектеп іс-шарасы: "${eventName}". Қатысушылар: ${grade}. Уақыты: ${duration} минут. 
    Толық сценарий, сайыс кезеңдері мен бағалау критерийлерін қазақ тілінде құрастыр.`;

    const budgetPrompt = `Мектеп іс-шарасы: "${eventName}", ${grade}, ${duration} минут. 
    Іс-шараға керекті құрал-жабдықтар (шарлар, баннер, грамоталар, дыбыс аппаратурасы т.б.) чеклистін және болжамды бюджетін дайында.`;

    const promoPrompt = `Мектеп іс-шарасы: "${eventName}", ${grade}. 
    Instagram парақшасы мен ата-аналар/оқушылар чатына арналған шақыру хабарландыруын жаз. Стилистикасы: қызықты, эмодзилермен және хэштегтермен.`;

    document.getElementById('scenarioResult').innerText = "⏳ AI сценарийді ойластыруда...";
    document.getElementById('budgetResult').innerText = "⏳ Ресурстар есептелуде...";
    document.getElementById('promoResult').innerText = "⏳ Пост дайындалуда...";

    resultsSection.classList.remove('hidden');

    const [scenario, budget, promo] = await Promise.all([
      callGeminiAPI(apiKey, scenarioPrompt),
      callGeminiAPI(apiKey, budgetPrompt),
      callGeminiAPI(apiKey, promoPrompt)
    ]);

    document.getElementById('scenarioResult').innerText = scenario;
    document.getElementById('budgetResult').innerText = budget;
    document.getElementById('promoResult').innerText = promo;

    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

  } catch (error) {
    alert("Қате орын алды: " + error.message);
  } finally {
    btnText.classList.remove('hidden');
    btnLoader.classList.add('hidden');
  }
}

// Gemini API жүгіну
async function callGeminiAPI(apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    throw new Error(`API Қатесі: ${response.statusText}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

// Демо деректер
function renderDemoData(eventName, grade, duration) {
  document.getElementById('scenarioResult').innerText = 
`🎯 ІС-ШАРА СЦЕНАРИЙІ: "${eventName}"
⏱️ Ұзақтығы: ${duration} минут | 👥 Қатысушылар: ${grade}

1. Кіріспе бөлім (10 мин):
   - Жүргізушілердің ашылу сөзі, әнұран.
   - Мектеп әкімшілігінің құттықтау сөзі.

2. Негізгі бөлім (25 мин):
   - 1-кезең: "Таныстыру" (Командалар презентациясы).
   - 2-кезең: "Білгірлер сайысы" (Сұрақ-жауап викторинасы).
   - 3-кезең: "Өнерлі өрге жүзер" (Шығармашылық номерлер).

3. Қорытынды & Марапаттау (10 мин):
   - Қазылар алқасының бағалауы.
   - Дипломдар мен грамоталар тапсыру.`;

  document.getElementById('budgetResult').innerText = 
`📋 РЕСУРСТАР МЕН БЮДЖЕТ ЧЕКЛИСТІ:

1. Рәсімдеу & Сахна:
   - Шараға арналған баннер (3x2m) - 15,000 ₸
   - Ша шарлар топтамасы (50 дана) - 5,000 ₸

2. Марапаттау қоры:
   - I, II, III дәрежелі дипломдар & рамкалар - 4,500 ₸
   - Кубок / Медалдар - 8,000 ₸

3. Техникалық жабдықтар:
   - 2 Микрофон, Ноутбук, Проектор (Мектеп базасынан).

Жиынтық болжамды бюджет: ~32,500 ₸`;

  document.getElementById('promoResult').innerText = 
`🎉 ҚҰРМЕТТІ ОҚУШЫЛАР МЕН АТА-АНАЛАР! 🌟

Сіздерді мектебімізде өтетін "${eventName}" атты салтанатты іс-шараға шақырамыз! 🥳

📅 Күні: Ертең
⏰ Уақыты: 15:00
📍 Өтетін орны: Мектептің Акт залы

Бағдарламада:
✨ Қызықты сайыстар & өнер көрсетулер
🏆 Белсенді қатысушыларды марапаттау
📸 Арнайы фотозона

Баршаңызды асыға күтеміз! ❤️
#МектепӨмірі #${eventName.replace(/\s+/g, '')} #МектепІсШарасы`;
}