// Глобальные переменные
let phrases = [];
const alphabetNav = document.getElementById('alphabetNav');
const phrasesContainer = document.getElementById('phrasesContainer');
const phraseDetail = document.getElementById('phraseDetail');
const phrasesList = document.getElementById('phrasesList');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const totalPhrasesElement = document.getElementById('totalPhrases');
const currentLetterElement = document.getElementById('currentLetter');
const letterCountElement = document.getElementById('letterCount');
const currentLetterTitle = document.getElementById('currentLetterTitle');
const currentLetterCount = document.getElementById('currentLetterCount');

let currentLetter = 'А';
let filteredPhrases = [];

// Загрузка данных из JSON
async function loadPhrasesData() {
    try {
        const response = await fetch('phrases.json');
        phrases = await response.json();
        console.log('Данные загружены:', phrases.length, 'фразеологизмов');
        totalPhrasesElement.textContent = phrases.length;
        createAlphabetNav();
        loadPhrasesByLetter(currentLetter);
        setupEventListeners();
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        phrasesContainer.innerHTML = '<div class="phrase-item"><p>Ошибка загрузки данных.</p></div>';
    }
}

// Создание навигации по алфавиту
function createAlphabetNav() {
    // Получаем уникальные буквы из данных
    const letters = [...new Set(phrases.map(phrase => phrase.letter))].sort();
    
    alphabetNav.innerHTML = '';
    
    letters.forEach(letter => {
        const letterElement = document.createElement('a');
        letterElement.href = '#';
        letterElement.className = 'alphabet-letter';
        letterElement.textContent = letter;
        letterElement.dataset.letter = letter;
        
        if (letter === currentLetter) {
            letterElement.classList.add('active');
        }
        
        letterElement.addEventListener('click', (e) => {
            e.preventDefault();
            currentLetter = letter;
            loadPhrasesByLetter(letter);
            
            // Обновляем активную букву
            document.querySelectorAll('.alphabet-letter').forEach(el => {
                el.classList.remove('active');
            });
            letterElement.classList.add('active');
            
            // Показываем список
            phrasesList.classList.remove('hidden');
            phraseDetail.classList.add('hidden');
            
            // Сбрасываем поиск
            searchInput.value = '';
        });
        
        alphabetNav.appendChild(letterElement);
    });
}

// Загрузка фразеологизмов по букве
function loadPhrasesByLetter(letter) {
    filteredPhrases = phrases.filter(phrase => phrase.letter === letter);
    
    // Обновляем статистику
    currentLetterElement.textContent = letter;
    currentLetterTitle.textContent = letter;
    letterCountElement.textContent = filteredPhrases.length;
    currentLetterCount.textContent = filteredPhrases.length;
    
    // Отображаем фразеологизмы
    displayPhrasesList(filteredPhrases);
}

// Отображение списка фразеологизмов
function displayPhrasesList(phrasesToDisplay) {
    phrasesContainer.innerHTML = '';
    
    if (phrasesToDisplay.length === 0) {
        phrasesContainer.innerHTML = '<div class="phrase-item"><p>Нет фразеологизмов.</p></div>';
        return;
    }
    
    phrasesToDisplay.forEach(phrase => {
        const phraseElement = document.createElement('div');
        phraseElement.className = 'phrase-item';
        
        const phraseLink = document.createElement('a');
        phraseLink.href = '#';
        phraseLink.className = 'phrase-link';
        phraseLink.innerHTML = `<i class="fas fa-angle-right"></i> ${phrase.title}`;
        phraseLink.dataset.id = phrase.id;
        
        phraseLink.addEventListener('click', (e) => {
            e.preventDefault();
            showPhraseDetail(phrase.id);
        });
        
        phraseElement.appendChild(phraseLink);
        phrasesContainer.appendChild(phraseElement);
    });
}

// ПРОСТОЙ ПОИСК
function performSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (!searchTerm) {
        // Если поле поиска пустое, возвращаемся к текущей букве
        loadPhrasesByLetter(currentLetter);
        return;
    }
    
    // Простой поиск по заголовку и значениям
    filteredPhrases = phrases.filter(phrase => {
        // Ищем в заголовке
        if (phrase.title.toLowerCase().includes(searchTerm)) {
            return true;
        }
        
        // Ищем в значениях
        const foundInMeanings = phrase.meanings.some(meaning => 
            meaning.text.toLowerCase().includes(searchTerm)
        );
        
        // Ищем в примерах
        const foundInExamples = phrase.examples.some(example => 
            example.toLowerCase().includes(searchTerm)
        );
        
        return foundInMeanings || foundInExamples;
    });
    
    // Обновляем интерфейс для поиска
    currentLetterElement.textContent = 'поиск';
    currentLetterTitle.textContent = 'поиск';
    letterCountElement.textContent = filteredPhrases.length;
    currentLetterCount.textContent = filteredPhrases.length;
    
    // Отображаем результаты
    displaySearchResults(filteredPhrases, searchTerm);
}

// Отображение результатов поиска
function displaySearchResults(results, searchTerm) {
    phrasesContainer.innerHTML = '';
    
    if (results.length === 0) {
        phrasesContainer.innerHTML = `
            <div class="phrase-item">
                <p>По запросу "<strong>${searchTerm}</strong>" ничего не найдено.</p>
            </div>
        `;
    } else {
        results.forEach(phrase => {
            const phraseElement = document.createElement('div');
            phraseElement.className = 'phrase-item';
            
            const phraseLink = document.createElement('a');
            phraseLink.href = '#';
            phraseLink.className = 'phrase-link';
            
            // Выделяем найденный текст в заголовке
            let highlightedTitle = phrase.title;
            const searchTermLower = searchTerm.toLowerCase();
            const titleLower = phrase.title.toLowerCase();
            
            if (titleLower.includes(searchTermLower)) {
                const startIndex = titleLower.indexOf(searchTermLower);
                const before = phrase.title.substring(0, startIndex);
                const match = phrase.title.substring(startIndex, startIndex + searchTerm.length);
                const after = phrase.title.substring(startIndex + searchTerm.length);
                
                highlightedTitle = `${before}<span style="background-color: #ffd700; padding: 0 2px; border-radius: 2px;">${match}</span>${after}`;
            }
            
            phraseLink.innerHTML = `<i class="fas fa-search"></i> ${highlightedTitle} 
                <span style="color: #666; font-size: 14px;">(буква ${phrase.letter})</span>`;
            
            phraseLink.dataset.id = phrase.id;
            
            phraseLink.addEventListener('click', (e) => {
                e.preventDefault();
                showPhraseDetail(phrase.id);
            });
            
            phraseElement.appendChild(phraseLink);
            phrasesContainer.appendChild(phraseElement);
        });
        
        // Добавляем информацию о поиске
        const infoDiv = document.createElement('div');
        infoDiv.className = 'phrase-item';
        infoDiv.style.backgroundColor = '#f8f9fa';
        infoDiv.style.padding = '10px';
        infoDiv.style.fontSize = '14px';
        infoDiv.style.color = '#666';
        infoDiv.innerHTML = `<i class="fas fa-info-circle"></i> Найдено ${results.length} фразеологизмов`;
        phrasesContainer.appendChild(infoDiv);
    }
    
    phrasesList.classList.remove('hidden');
    phraseDetail.classList.add('hidden');
    document.querySelector('.section-header h2').innerHTML = `Результаты поиска: <span id="currentLetterTitle">"${searchTerm}"</span>`;
}

// Показ деталей фразеологизма
function showPhraseDetail(phraseId) {
    const phrase = phrases.find(p => p.id === phraseId);
    
    if (!phrase) return;
    
    let detailHTML = `
        <a href="#" class="back-btn" id="backBtn"><i class="fas fa-arrow-left"></i> Назад к списку</a>
        <h2 class="phrase-title">${phrase.title}</h2>
        <div class="phrase-info">${phrase.info}</div>
        <div class="phrase-meaning">
            <div class="meaning-title">Значение:</div>
    `;
    
    phrase.meanings.forEach(meaning => {
        detailHTML += `
            <div class="meaning-text">
                <strong>${meaning.number}</strong> ${meaning.text}
            </div>
        `;
    });
    
    detailHTML += `</div>`;
    
    if (phrase.examples && phrase.examples.length > 0) {
        detailHTML += `
            <div class="phrase-meaning">
                <div class="meaning-title">Примеры употребления:</div>
        `;
        
        phrase.examples.forEach(example => {
            detailHTML += `<div class="example">${example}</div>`;
        });
        
        detailHTML += `</div>`;
    }
    
    phraseDetail.innerHTML = detailHTML;
    
    document.getElementById('backBtn').addEventListener('click', (e) => {
        e.preventDefault();
        phraseDetail.classList.add('hidden');
        phrasesList.classList.remove('hidden');
    });
    
    phraseDetail.classList.remove('hidden');
    phrasesList.classList.add('hidden');
}


function setupEventListeners() {
    
    searchBtn.addEventListener('click', performSearch);
    
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        
        const searchTerm = searchInput.value.trim();
        
        if (searchTerm.length >= 2) {
            searchTimeout = setTimeout(() => {
                performSearch();
            }, 100); 
        } else if (searchTerm.length === 0) {
            loadPhrasesByLetter(currentLetter);
        }
    });
}


document.addEventListener('DOMContentLoaded', () => {
    loadPhrasesData();
});