import { useSelector } from 'react-redux';
import { fetchBrands, fetchOffers } from '../store/searchSlice';
import { useLatestRequest } from '../useLatestRequest';
import { formatCount } from '../format';
import ErrorAlert from './ErrorAlert';
import Loader from './Loader';

export default function BrandList() {
  const { query, selectedBrand, brands } = useSelector((state) => state.search);
  const offersRequest = useLatestRequest();
  const brandsRequest = useLatestRequest();

  if (brands.status === 'idle') return null;
  if (brands.status === 'loading') return <Loader text="Ищем производителей…" />;
  if (brands.status === 'failed') {
    return <ErrorAlert message={brands.error} onRetry={() => brandsRequest.run(fetchBrands(query))} />;
  }
  if (!brands.items.length) {
    return (
      <p className="text-secondary py-2 mb-0">
        По артикулу «{query}» ничего не нашлось. Проверьте номер детали.
      </p>
    );
  }

  return (
    <section aria-labelledby="brands-title">
      <h2 id="brands-title" className="h6 text-uppercase text-secondary mb-3">
        Производители · {brands.items.length}
      </h2>
      <div className="brand-grid">
        {brands.items.map((item) => {
          const active = item.brand === selectedBrand;
          return (
            <button
              key={item.key}
              type="button"
              className={`brand-card ${active ? 'is-active' : ''}`}
              aria-pressed={active}
              onClick={() => offersRequest.run(fetchOffers(item.brand))}
            >
              <span className="brand-card__brand">{item.brand}</span>
              <span className="brand-card__name">{item.name}</span>
              <span className="brand-card__meta">
                <span className="font-monospace">{item.number}</span>
                <span className={item.count > 0 ? 'text-success' : 'text-secondary'}>
                  {item.count > 0 ? formatCount(item.count) : 'нет в наличии'}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
