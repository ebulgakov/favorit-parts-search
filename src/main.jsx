import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import App from './App';
import { createStore } from './store';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={createStore()}>
      <App />
    </Provider>
  </StrictMode>,
);
