import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("App Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: '#b91c1c', background: '#fee2e2', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <h2>Algo salió mal al cargar LotoPro</h2>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#fff', padding: 12, borderRadius: 8, border: '1px solid #f87171' }}>
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{ marginTop: 12, padding: '8px 16px', background: '#b91c1c', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
          >
            Limpiar caché y recargar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
