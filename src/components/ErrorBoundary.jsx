import { Component } from 'react';

// Ловит ошибки рендера, чтобы вместо белого экрана показать понятное сообщение.
// Error Boundary до сих пор можно написать только классом.
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error(error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="alert alert-danger" role="alert">
          Что-то пошло не так.{' '}
          <button type="button" className="btn btn-link alert-link p-0 align-baseline" onClick={() => window.location.reload()}>
            Обновить страницу
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
