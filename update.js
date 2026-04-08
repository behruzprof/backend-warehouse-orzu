const fs = require('fs/promises');
const QRCode = require('qrcode');
const { createCanvas, loadImage } = require('canvas');

const generateQRCodes = async () => {
  try {
    // 1. Получаем все лекарства из базы
    console.log("Получение списка всех лекарств...");
    const getResponse = await fetch('http://localhost:3001/drugs');
    
    if (!getResponse.ok) {
      throw new Error(`Не удалось получить список: ${getResponse.statusText}`);
    }

    const allDrugs = await getResponse.json();
    console.log(`Найдено лекарств: ${allDrugs.length}`);

    // Создаем папку для сохранения QR-кодов, если ее нет
    const outputDir = './qrcodes';
    await fs.mkdir(outputDir, { recursive: true });

    // 2. Проходимся по каждому лекарству и генерируем картинку
    for (const drug of allDrugs) {
      // Предполагаем, что название хранится в поле 'name'. 
      // Если поле называется иначе (например, 'title'), замените его здесь.
      const { id, name } = drug; 
      
      if (!id || !name) {
        console.warn(`⚠️ Пропущено лекарство (нет id или name):`, drug);
        continue;
      }

      // Формируем значение для QR-кода
      const qrValue = `${id};20`;

      // Генерируем QR-код в виде Data URL
      const qrDataUrl = await QRCode.toDataURL(qrValue, {
        width: 300,
        margin: 2,
        errorCorrectionLevel: 'H'
      });

      // 3. Создаем холст (Canvas) для объединения текста и QR-кода
      const canvasWidth = 300;
      const canvasHeight = 350; // 50 пикселей сверху выделяем под текст
      const canvas = createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext('2d');

      // Заливаем фон белым цветом
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Настраиваем и рисуем текст (название лекарства)
      ctx.fillStyle = '#000000'; // Черный текст
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      
      // Рисуем текст по центру (x = canvasWidth / 2) и отступаем 30px сверху
      // Ограничиваем ширину текста (canvasWidth - 20), чтобы длинные названия не вылезали
      ctx.fillText(name, canvasWidth / 2, 30, canvasWidth - 20);

      // Загружаем сгенерированный QR-код и рисуем его под текстом (смещение по Y = 50)
      const qrImage = await loadImage(qrDataUrl);
      ctx.drawImage(qrImage, 0, 50, 300, 300);

      // 4. Сохраняем итоговое изображение в PNG
      const buffer = canvas.toBuffer('image/png');
      const fileName = `${outputDir}/drug_${id}.png`;
      await fs.writeFile(fileName, buffer);

      console.log(`✅ Создан QR-код для: ${name} -> ${fileName}`);
    }

    console.log(`🎉 Успех! Все картинки сохранены в папку "${outputDir}".`);
    
  } catch (error) {
    console.error('❌ Произошла ошибка:', error.message);
  }
};

generateQRCodes();