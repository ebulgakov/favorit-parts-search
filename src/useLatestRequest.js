import { useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

// Отправляет thunk и отменяет предыдущий запрос того же вида,
// чтобы при быстром вводе не висели лишние запросы к API.
export function useLatestRequest() {
  const dispatch = useDispatch();
  const current = useRef(null);

  const abort = useCallback(() => current.current?.abort(), []);

  const run = useCallback(
    (thunkAction) => {
      abort();
      current.current = dispatch(thunkAction);
      return current.current;
    },
    [dispatch, abort],
  );

  useEffect(() => abort, [abort]);

  return { run, abort };
}
