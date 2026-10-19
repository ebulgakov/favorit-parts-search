const priceFormat = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 2,
});

export const formatPrice = (value) => priceFormat.format(value);

export const formatCount = (value) => `${value} шт.`;
