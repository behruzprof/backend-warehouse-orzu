const updateAllExistingDrugs = async () => {
  try {
    // 1. Получаем все лекарства из базы
    console.log("Получение списка всех лекарств...");
    const getResponse = await fetch('http://localhost:3001/drugs');
    
    if (!getResponse.ok) {
      throw new Error(`Не удалось получить список: ${getResponse.statusText}`);
    }

    const allDrugs = await getResponse.json();
    console.log(`Найдено лекарств: ${allDrugs.length}`);

    // 2. Формируем массив для массового обновления
    // Оставляем только id и меняем quantity на 10000
    const updates = allDrugs.map(drug => ({
      id: drug.id,
      quantity: 10000
    }));

    // 3. Отправляем обновление обратно через наш batch-эндпоинт
    console.log("Отправка обновлений в базу...");
    const patchResponse = await fetch('http://localhost:3001/drugs/batch', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        // 'x-api-key': 'ВАШ_КЛЮЧ' // если guard включен
      },
      body: JSON.stringify({ updates })
    });

    const result = await patchResponse.json();

    if (!patchResponse.ok) {
      console.error('❌ Ошибка при обновлении:', JSON.stringify(result, null, 2));
      return;
    }

    console.log(`✅ Успех! Количество ${allDrugs.length} лекарств изменено на 10000.`);
    
  } catch (error) {
    console.error('❌ Произошла ошибка:', error.message);
  }
};

updateAllExistingDrugs();