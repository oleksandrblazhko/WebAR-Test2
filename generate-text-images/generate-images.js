const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Масив слів для генерації
const words = [
    'Realidade',
    'Palavra',
    'Livro',
    'Casa',
    'Carro',
    'Água',
    'Comida',
    'Amigo',
    'Trabalho',
    'Escola'
];

// Налаштування зображень
const config = {
    width: 400,           // Ширина зображення (px)
    height: 300,          // Висота зображення (px)
    backgroundColor: '#ffffff',  // Колір фону
    textColor: '#000000',        // Колір тексту
    fontSize: 48,                // Розмір шрифту (px)
    fontFamily: 'Arial',         // Шрифт
    outputDir: './output'        // Папка для вихідних файлів
};

// Створюємо папку для вихідних файлів
if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
}

// Функція для створення зображення з текстом
function createTextImage(word, index) {
    const canvas = createCanvas(config.width, config.height);
    const ctx = canvas.getContext('2d');

    // Заповнюємо фон
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, config.width, config.height);

    // Налаштовуємо шрифт
    ctx.font = `bold ${config.fontSize}px ${config.fontFamily}`;
    ctx.fillStyle = config.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Малюємо текст по центру
    ctx.fillText(word, config.width / 2, config.height / 2);

    // Зберігаємо зображення
    const fileName = `${word.replace(/\s+/g, '_')}.jpg`;
    const filePath = path.join(config.outputDir, fileName);
    
    const buffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });
    fs.writeFileSync(filePath, buffer);

    console.log(`[${index + 1}/${words.length}] Створено: ${fileName}`);
}

// Генеруємо зображення для кожного слова
console.log('Початок генерації зображень...\n');
words.forEach((word, index) => {
    createTextImage(word, index);
});

console.log(`\nГотово! Створено ${words.length} зображень у папці "${config.outputDir}"`);
