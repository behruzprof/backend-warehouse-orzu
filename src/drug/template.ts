export const template = [
  {
    id: 243213,
    name: 'СЕННА',
    unit: 'pcs',
    quantity: 9999,
    minStock: 10000,
    maxStock: 10,
    supplier: 'ORZU-MED',
    IsStandard: false,
    costPerPiece: 0,
    piece: 0,
    purchaseAmount: 0,
    expiryDate: '2026-03-31',
    shelf: '',
    section: '',
    row: 0,
    category: 'Бошқалар',
    arrivalDate: '2026-03-31',
  },
  {
    id: 799446,
    name: 'Фиточай ACD 2ф 0.5 эрт 2махал',
    unit: 'pcs',
    quantity: 2,
    minStock: 0,
    maxStock: 0,
    supplier: 'Не указан',
    purchaseAmount: 0,
    IsStandard: true, // или false, в зависимости от того, нужен ли он по умолчанию
    costPerPiece: 0,
    piece: 0,
    expiryDate: '2026-04-10',
    shelf: null,
    section: 'Таблетки',
    row: 1,
    category: 'Фитотерапия',
    arrivalDate: '2026-04-01',
    arrivals: [],
    drugRequests: [],
  },
  {
    id: 336046,
    name: 'Актив уголь 2 та 1 махал 20:00 да',
    unit: 'pcs',
    quantity: 2,
    minStock: 0,
    maxStock: 0,
    supplier: 'Не указан',
    purchaseAmount: 0,
    IsStandard: true,
    costPerPiece: 0,
    piece: 0,
    expiryDate: '2026-04-10',
    shelf: null,
    section: 'Таблетки',
    row: 10,
    category: 'Сорбенты',
    arrivalDate: '2026-04-01',
    arrivals: [],
    drugRequests: [],
  },
  {
    id: 195576,
    name: 'Бифидум 2 фл х 1махал эрт',
    unit: 'pcs',
    quantity: 2,
    minStock: 0,
    maxStock: 0,
    supplier: 'Не указан',
    purchaseAmount: 0,
    IsStandard: true,
    costPerPiece: 0,
    piece: 0,
    expiryDate: '2026-04-10',
    shelf: null,
    section: 'Таблетки',
    row: 8,
    category: 'Пробиотики',
    arrivalDate: '2026-04-01',
    arrivals: [],
    drugRequests: [],
  },
  {
    id: 680032,
    name: 'Кислородный пенка',
    unit: 'pcs',
    quantity: 0,
    minStock: 0,
    maxStock: 0,
    supplier: 'Не указан',
    purchaseAmount: 0,
    IsStandard: true,
    costPerPiece: 0,
    piece: 0,
    expiryDate: '2026-04-10',
    shelf: null,
    section: 'Процедуры',
    row: 7,
    category: 'Манипуляции',
    arrivalDate: '2026-04-01',
    arrivals: [],
    drugRequests: [],
  },
  {
    id: 39184,
    name: 'Кальций Д-3 х 1 махал пешин',
    unit: 'pcs',
    quantity: 1,
    minStock: 0,
    maxStock: 0,
    supplier: 'Не указан',
    purchaseAmount: 0,
    IsStandard: true,
    costPerPiece: 0,
    piece: 0,
    expiryDate: '2026-04-10',
    shelf: null,
    section: 'Таблетки',
    row: 9,
    category: 'Витамины',
    arrivalDate: '2026-04-01',
    arrivals: [],
    drugRequests: [],
  },
  {
    id: 39231,
    name: 'ГЕПАТАХАЛИСИСТИТ 18 ',
    unit: 'pcs',
    quantity: 9997,
    minStock: 10000,
    maxStock: 10,
    supplier: 'ORZU-MED',
    IsStandard: false,
    costPerPiece: 0,
    piece: 0,
    purchaseAmount: 0,
    expiryDate: '2026-03-31',
    shelf: '',
    section: '',
    row: 0,
    category: 'Бошқалар',
    arrivalDate: '2026-03-31',
  },
  {
    id: 205,
    name: 'ЖКТ 37 ',
    unit: 'pcs',
    quantity: 10000,
    minStock: 10000,
    maxStock: 10,
    supplier: 'ORZU-MED',
    IsStandard: false,
    costPerPiece: 0,
    piece: 0,
    purchaseAmount: 0,
    expiryDate: '2026-03-31',
    shelf: '',
    section: '',
    row: 0,
    category: 'Бошқалар',
    arrivalDate: '2026-03-31',
  },
  {
    id: 243907,
    name: 'Дармон мазь елка, бел, оёклар, тизза',
    unit: 'pcs',
    quantity: 0,
    minStock: 0,
    maxStock: 0,
    supplier: 'Не указан',
    purchaseAmount: 0,
    IsStandard: true,
    costPerPiece: 0,
    piece: 0,
    expiryDate: '2026-04-10',
    shelf: null,
    section: 'Процедуры',
    row: 18,
    category: 'Мази',
    arrivalDate: '2026-04-01',
    arrivals: [],
    drugRequests: [],
  },
];

// 📌 КОНФИГУРАЦИЯ ШАБЛОНОВ (НАБОРОВ)
// Ключ: Числовой ID шаблона из массива `template`
// Значение: Массив реальных лекарств (id в базе) и их количество (qty), которые нужно списать.
export const TEMPLATE_COMPONENTS: Record<
  number,
  { id: number | string; qty: number }[]
> = {
  // 1. Фиточай ACD 2ф 0.5 эрт 2махал
  799446: [
    { id: 25, qty: 1 },
    { id: 43, qty: 8 },
  ],

  // 2. Живая вода
  661691: [
    // Пример: { id: 10, qty: 1 }
  ],

  // 3. Кислородный пенка
  680032: [
    // Пример: { id: 15, qty: 1 }
  ],

  // 4. Бифидум 2 фл х 1махал эрт
  195576: [
    // Укажите ID реального Бифидума
  ],

  // 5. Кальций Д-3 х 1 махал пешин
  39184: [
    // Укажите ID реального Кальция Д-3
  ],

  // 6. Актив уголь 2 та 1 махал 20:00 да
  336046: [
    // Укажите ID реального Активированного угля
  ],

  // 7. S Сода 4%-200,0 мл
  93515: [
    // Укажите ID реальной Соды
  ],

  // 8. S NaCl 0,9%-200,0 мл+ Sol.перикись 2мл
  314876: [
    // Пример (укажите реальные ID):
    // { id: 101, qty: 1 }, // NaCl 0.9%
    // { id: 102, qty: 2 }  // Перекись водорода
  ],

  // 9. S NaCl 0,9%-200,0 мл
  121334: [
    // Укажите ID реального NaCl
  ],

  // 10. Sol. АЗОН в/в
  292758: [
    // Укажите ID реального АЗОН
  ],

  // 11. Sol. БЛОК лазер в/в
  26499: [
    // Укажите ID реального БЛОК лазер
  ],

  // 12. Sol. Рибаксин 5ми в/в
  399253: [
    // Укажите ID реального Рибаксина
  ],

  // 13. Sol. Пирацетам 20%-5ми в/в
  359045: [
    // Укажите ID реального Пирацетама
  ],

  // 14. Дармон мазь елка, бел, оёклар, тизза
  243907: [
    // Укажите ID реальной Дармон мази
  ],
};
