import BrandList from './components/BrandList';
import ErrorBoundary from './components/ErrorBoundary';
import OffersTable from './components/OffersTable';
import SearchForm from './components/SearchForm';

export default function App() {
  return (
    <>
      <header className="app-header">
        <div className="container">
          <h1 className="h4 mb-1">Подбор запчастей и аналогов</h1>
          <p className="mb-0 opacity-75">Введите артикул, выберите производителя и сравните предложения</p>
        </div>
      </header>

      <main className="container py-4">
        <ErrorBoundary>
          <div className="panel mb-4">
            <SearchForm />
          </div>
          <div className="d-grid gap-4">
            <BrandList />
            <OffersTable />
          </div>
        </ErrorBoundary>
      </main>
    </>
  );
}
