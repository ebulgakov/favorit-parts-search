import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchBrands, searchCleared } from '../store/searchSlice';
import { useLatestRequest } from '../useLatestRequest';

const MIN_LENGTH = 3;
const DEBOUNCE_MS = 600;

// Поиск запускается сам, когда пользователь перестал печатать,
// или сразу по Enter / кнопке.
export default function SearchForm() {
  const dispatch = useDispatch();
  const { run, abort } = useLatestRequest();
  const [value, setValue] = useState('');
  const timer = useRef(null);

  const number = value.trim();
  const tooShort = number.length > 0 && number.length < MIN_LENGTH;

  useEffect(() => {
    clearTimeout(timer.current);
    if (!number) {
      abort();
      dispatch(searchCleared());
      return;
    }
    if (number.length < MIN_LENGTH) return;
    timer.current = setTimeout(() => run(fetchBrands(number)), DEBOUNCE_MS);
    return () => clearTimeout(timer.current);
  }, [number, run, abort, dispatch]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (number.length < MIN_LENGTH) return;
    clearTimeout(timer.current);
    run(fetchBrands(number));
  };

  return (
    <form onSubmit={handleSubmit} role="search" noValidate>
      <label htmlFor="part-number" className="form-label fw-semibold">
        Артикул детали
      </label>
      <div className="input-group input-group-lg">
        <input
          id="part-number"
          type="search"
          className="form-control"
          placeholder="Например, 0189 или 7160500039S"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoComplete="off"
          autoFocus
          aria-describedby="part-number-hint"
        />
        <button type="submit" className="btn btn-primary px-4" disabled={number.length < MIN_LENGTH}>
          Найти
        </button>
      </div>
      <div id="part-number-hint" className="form-text">
        {tooShort ? `Введите хотя бы ${MIN_LENGTH} символа` : 'Поиск начнётся автоматически'}
      </div>
    </form>
  );
}
