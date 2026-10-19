// Приведение ответов «Проценки» к виду, удобному для интерфейса.
// Все функции чистые: их легко покрыть тестами без сети.

const EMPTY_GOODS_ID = '00000000-0000-0000-0000-000000000000';

const API_ERRORS = {
  'Empty key!': 'Не указан ключ покупателя',
  'Invalid key client!': 'Неверный ключ покупателя',
  'Empty number goods!': 'Не указан номер детали',
  'Request quota exceeded!': 'Превышен лимит запросов, попробуйте позже',
};

export class ApiError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ApiError';
  }
}

export function translateApiError(raw) {
  const text = String(raw);
  const known = Object.keys(API_ERRORS).filter((code) => text.includes(code));
  return known.length ? known.map((code) => API_ERRORS[code]).join('. ') : text;
}

// Ошибки API приходят с кодом 200 в поле error,
// а «не найдено» — массивом с одной пустой структурой.
export function unwrapGoods(json) {
  if (!json || typeof json !== 'object') {
    throw new ApiError('Сервер вернул некорректный ответ');
  }
  if (json.error) {
    throw new ApiError(translateApiError(json.error));
  }
  if (!Array.isArray(json.goods)) {
    throw new ApiError('Сервер вернул некорректный ответ');
  }
  return json.goods.filter((good) => !isEmptyGood(good));
}

export function isEmptyGood(good) {
  return !good || !good.brand || good.goodsID === EMPTY_GOODS_ID;
}

// Этап 1: уникальные бренды.
// API ищет номер без учёта разделителей: по запросу 0189 CAFFARO приходит как «01-89».
// Поэтому на втором шаге передаём номер из запроса, а номер из ответа только показываем.
export function toBrands(goods) {
  const seen = new Map();
  for (const good of goods) {
    const key = good.brand;
    if (!seen.has(key)) {
      seen.set(key, {
        key,
        brand: good.brand,
        number: good.number,
        name: good.name,
        count: toNumber(good.count),
      });
    }
  }
  return [...seen.values()].sort((a, b) => a.brand.localeCompare(b.brand, 'ru'));
}

// Этап 2: искомая деталь + аналоги одним списком.
// Сначала оригинал, потом то, что есть в наличии (дешевле выше), потом остальное.
export function toProducts(goods) {
  const products = new Map();
  for (const good of goods) {
    add(products, good, true);
    for (const analogue of good.analogues ?? []) {
      if (!isEmptyGood(analogue)) add(products, analogue, false);
    }
  }
  return [...products.values()].sort(compareProducts);
}

function add(map, good, isOriginal) {
  if (!map.has(good.goodsID)) map.set(good.goodsID, toProduct(good, isOriginal));
}

export function toProduct(good, isOriginal = false) {
  const offers = (good.warehouses ?? [])
    .map((warehouse, index) => toOffer(warehouse, `${good.goodsID}-${index}`))
    .sort((a, b) => a.price - b.price);

  return {
    id: good.goodsID,
    brand: good.brand,
    number: good.number,
    name: good.name,
    count: toNumber(good.count),
    rate: toNumber(good.rate) || 1,
    notRefund: Boolean(good.notRefund),
    isOriginal,
    offers,
    // Корневой price в документации помечен «НЕ ИСПОЛЬЗОВАТЬ»,
    // поэтому минимальную цену считаем по складам.
    minPrice: offers.length ? offers[0].price : null,
  };
}

function toOffer(warehouse, id) {
  return {
    id,
    warehouse: warehouse.code || 'Склад поставщика',
    own: Boolean(warehouse.own),
    price: toNumber(warehouse.price),
    stock: toNumber(warehouse.stock),
    shipment: parseShipment(warehouse.shipmentDate),
    notRefund: Boolean(warehouse.notRefund),
  };
}

// «2019-05-31T15:30:00+03:00»: дата отгрузки и время, до которого нужно заказать.
// Разбираем строку как есть, чтобы не сдвинуть время в часовой пояс браузера.
export function parseShipment(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value ?? '');
  if (!match) return null;
  const [, year, month, day, hours, minutes] = match;
  return { date: `${day}.${month}.${year}`, orderUntil: `${hours}:${minutes}` };
}

function compareProducts(a, b) {
  if (a.isOriginal !== b.isOriginal) return a.isOriginal ? -1 : 1;
  const aInStock = a.minPrice !== null && a.count > 0;
  const bInStock = b.minPrice !== null && b.count > 0;
  if (aInStock !== bInStock) return aInStock ? -1 : 1;
  return (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity);
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}
