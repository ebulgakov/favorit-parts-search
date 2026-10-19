import { useSelector } from 'react-redux';
import { fetchOffers } from '../store/searchSlice';
import { useLatestRequest } from '../useLatestRequest';
import { formatCount, formatPrice } from '../format';
import ErrorAlert from './ErrorAlert';
import Loader from './Loader';

export default function OffersTable() {
  const { selectedBrand, brands, offers } = useSelector((state) => state.search);
  const { run } = useLatestRequest();

  if (brands.status !== 'succeeded' || !brands.items.length) return null;
  if (!selectedBrand) {
    return <p className="text-secondary mb-0">Выберите производителя, чтобы увидеть предложения и аналоги.</p>;
  }
  if (offers.status === 'loading') return <Loader text="Ищем предложения и аналоги…" />;
  if (offers.status === 'failed') {
    return <ErrorAlert message={offers.error} onRetry={() => run(fetchOffers(selectedBrand))} />;
  }
  if (!offers.items.length) {
    return <p className="text-secondary mb-0">Для {selectedBrand} предложений не нашлось.</p>;
  }

  const inStock = offers.items.filter((product) => product.count > 0).length;

  return (
    <section aria-labelledby="offers-title">
      <div className="d-flex flex-wrap align-items-baseline justify-content-between gap-2 mb-3">
        <h2 id="offers-title" className="h6 text-uppercase text-secondary mb-0">
          Предложения и аналоги · {selectedBrand}
        </h2>
        <span className="small text-secondary">
          Позиций: {offers.items.length}, в наличии: {inStock}
        </span>
      </div>

      <div className="offers">
        <table className="table offers-table align-middle mb-0">
          <thead>
            <tr>
              <th scope="col">Деталь</th>
              <th scope="col">Склад</th>
              <th scope="col">Отгрузка</th>
              <th scope="col" className="text-end">Остаток</th>
              <th scope="col" className="text-end">Цена</th>
            </tr>
          </thead>
          {offers.items.map((product) => (
            <ProductRows key={product.id} product={product} />
          ))}
        </table>
      </div>
    </section>
  );
}

// Одна деталь = отдельный tbody: строка на каждый склад, описание детали
// объединено через rowSpan. На узком экране таблица складывается в карточки.
function ProductRows({ product }) {
  const rowSpan = Math.max(product.offers.length, 1);
  const productCell = (
    <th scope="rowgroup" rowSpan={rowSpan} className="offers-table__product">
      <div className="d-flex flex-wrap align-items-center gap-1 mb-1">
        <span className="fw-semibold">{product.brand}</span>
        <span className="font-monospace small text-secondary">{product.number}</span>
        {product.isOriginal && <span className="badge text-bg-primary">Искомая</span>}
        {product.notRefund && <span className="badge text-bg-warning">Невозвратная</span>}
        {product.rate > 1 && <span className="badge text-bg-light border">Кратность {product.rate}</span>}
      </div>
      <div className="fw-normal small">{product.name}</div>
    </th>
  );

  if (!product.offers.length) {
    return (
      <tbody className="is-empty">
        <tr>
          {productCell}
          <td colSpan={4} className="text-secondary" data-label="Наличие">
            Нет в наличии
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {product.offers.map((offer, index) => (
        <tr key={offer.id}>
          {index === 0 && productCell}
          <td data-label="Склад">
            {offer.warehouse}
            {offer.own && <span className="badge text-bg-success ms-1">Наш склад</span>}
            {offer.notRefund && !product.notRefund && (
              <span className="badge text-bg-warning ms-1">Без возврата</span>
            )}
          </td>
          <td data-label="Отгрузка">
            {offer.shipment ? (
              <>
                {offer.shipment.date}
                <div className="small text-secondary">заказ до {offer.shipment.orderUntil}</div>
              </>
            ) : (
              '—'
            )}
          </td>
          <td data-label="Остаток" className="text-end text-nowrap">
            {formatCount(offer.stock)}
          </td>
          <td data-label="Цена" className="text-end text-nowrap fw-semibold">
            {formatPrice(offer.price)}
          </td>
        </tr>
      ))}
    </tbody>
  );
}
