import { describe, expect, it } from 'vitest';
import { parseShipment, toBrands, toProducts, unwrapGoods } from './normalize';
import { byNumber0189, emptyKeyError, notFound, withAnaloguesMeyle } from './__fixtures__/responses';

describe('unwrapGoods', () => {
  it('считает «пустую структуру» из API отсутствием результатов', () => {
    expect(unwrapGoods(notFound)).toEqual([]);
  });

  it('превращает поле error в понятную ошибку, хотя HTTP-код 200', () => {
    expect(() => unwrapGoods(emptyKeyError)).toThrow('Не указан ключ покупателя');
  });

  it('показывает неизвестную ошибку API как есть', () => {
    expect(() => unwrapGoods({ error: 'Something new' })).toThrow('Something new');
  });

  it('не падает на ответе неожиданной формы', () => {
    expect(() => unwrapGoods({ foo: 1 })).toThrow('некорректный ответ');
    expect(() => unwrapGoods(null)).toThrow('некорректный ответ');
  });
});

describe('toBrands', () => {
  it('возвращает уникальных производителей по алфавиту', () => {
    const brands = toBrands(unwrapGoods(byNumber0189));
    expect(brands.map((b) => b.brand)).toEqual(['CAFFARO', 'NGK/NTK', 'ZEN']);
  });

  it('не дублирует бренд, если он пришёл с разными написаниями номера', () => {
    const goods = [
      { brand: 'CAFFARO', number: '0189', goodsID: '1' },
      { brand: 'CAFFARO', number: '01-89', goodsID: '2' },
    ];
    expect(toBrands(goods)).toHaveLength(1);
  });
});

describe('toProducts', () => {
  const products = toProducts(unwrapGoods(withAnaloguesMeyle));

  it('ставит искомую деталь первой, аналоги в наличии выше отсутствующих', () => {
    expect(products.map((p) => [p.brand, p.isOriginal])).toEqual([
      ['MEYLE', true],
      ['Hapco', false],
      ['MEYLE', false],
    ]);
  });

  it('берёт цену со склада, а не устаревшее корневое поле price', () => {
    const good = {
      ...withAnaloguesMeyle.goods[0],
      price: 1,
      warehouses: [
        { code: 'A', price: 500, stock: 1 },
        { code: 'B', price: 300, stock: 2 },
      ],
    };
    const [product] = toProducts([good]);
    expect(product.minPrice).toBe(300);
    expect(product.offers.map((o) => o.warehouse)).toEqual(['B', 'A']);
  });

  it('оставляет деталь без складов в списке, но без цены', () => {
    const empty = products.find((p) => p.number === '7160500039/SK');
    expect(empty.offers).toEqual([]);
    expect(empty.minPrice).toBeNull();
  });
});

describe('parseShipment', () => {
  it('берёт дату и время заказа из строки без сдвига часового пояса', () => {
    expect(parseShipment('2019-05-31T15:30:00+03:00')).toEqual({
      date: '31.05.2019',
      orderUntil: '15:30',
    });
  });

  it('возвращает null для пустого значения', () => {
    expect(parseShipment(undefined)).toBeNull();
  });
});
