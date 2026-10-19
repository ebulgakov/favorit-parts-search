export default function ErrorAlert({ message, onRetry }) {
  return (
    <div
      className="alert alert-danger d-flex flex-wrap align-items-center justify-content-between gap-2"
      role="alert"
    >
      <span>{message}</span>
      {onRetry && (
        <button type="button" className="btn btn-sm btn-outline-danger" onClick={onRetry}>
          Повторить
        </button>
      )}
    </div>
  );
}
