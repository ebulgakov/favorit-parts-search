// Ответы API из документации (https://lk.favorit-parts.ru/static/wsprice.pdf).
// Используются в тестах и в демо-режиме VITE_USE_MOCKS=true.

const MC2 = {
  code: 'МС2',
  id: 'E8C31C27-031C-11E7-80CF-0050568E1762',
  own: false,
  warehouseShipping: '9506B522-2875-11E4-9621-0050568E0E34',
};

export const byNumber0189 = {
  goods: [
    {
      brand: 'ZEN',
      count: 6,
      goodsID: 'E8C80534-6D88-4E7A-8DE1-87EE5691C042',
      name: 'Бендикс',
      number: '0189',
      price: 367.92,
      rate: 1,
      warehouses: [{ ...MC2, price: 367.92, shipmentDate: '2019-05-31T15:30:00+03:00', stock: 6 }],
    },
    {
      brand: 'NGK/NTK',
      count: 0,
      goodsID: '74E7ABE5-14D4-439D-9EB7-4E7F18FF0C6C',
      name: 'Лямбда-зонд',
      number: '0189',
      price: 0,
      rate: 1,
      warehouses: [],
    },
    {
      brand: 'CAFFARO',
      count: 4,
      goodsID: '9769C10C-5401-4C55-8798-5B3774FA9642',
      name: 'Ролик п/клин. ремня',
      number: '01-89',
      price: 429.96,
      rate: 1,
      warehouses: [{ ...MC2, price: 429.96, shipmentDate: '2019-05-31T15:30:00+03:00', stock: 4 }],
    },
  ],
};

const meyle = {
  brand: 'MEYLE',
  count: 20,
  goodsID: '1FAFD8CA-F73E-11DC-A83E-000E0CE9B9AA',
  name: 'Рычаги задней подвески ( ком кт на 2 е стороны)',
  number: '7160500039/S',
  price: 12533.62,
  rate: 1,
  warehouses: [{ ...MC2, price: 12533.62, shipmentDate: '2019-05-31T15:30:00+03:00', stock: 20 }],
};

export const byNumberMeyle = { goods: [meyle] };

export const withAnaloguesMeyle = {
  goods: [
    {
      ...meyle,
      analogues: [
        {
          brand: 'Hapco',
          count: 10,
          goodsID: '9FF83D2A-22FD-11E0-81EF-001517C72418',
          name: 'Комплект рычагов задней подвески 6 шт.с болтами',
          number: '53612/1',
          price: 8680.2,
          rate: 1,
          warehouses: [
            {
              code: 'ПТ4',
              id: 'B70E79B8-10CD-11E8-8136-0050568E1762',
              own: false,
              price: 8680.2,
              shipmentDate: '2019-06-01T13:30:00+03:00',
              stock: 10,
              warehouseShipping: '9506B522-2875-11E4-9621-0050568E0E34',
            },
          ],
        },
        {
          brand: 'MEYLE',
          count: 0,
          goodsID: 'DB661B6A-F980-11DF-A27F-001517C72418',
          name: 'Рычаги задней подвески ( ком кт на 1 у сторону)',
          number: '7160500039/SK',
          price: 0,
          rate: 1,
          warehouses: [],
        },
      ],
    },
  ],
};

export const notFound = {
  goods: [
    {
      brand: '',
      count: 0,
      goodsID: '00000000-0000-0000-0000-000000000000',
      name: '',
      number: '',
      price: 0,
      rate: 0,
      warehouses: [],
    },
  ],
};

export const emptyKeyError = { error: 'Empty key!' };
