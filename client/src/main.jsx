import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { reportClientError } from './services/errorLogService';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CartProvider } from './contexts/CartContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import './index.css';

// staleTime: 30s means revisiting a page within 30 seconds shows the
// cached data instantly (no loading state), while still refetching in the
// background if it's been longer - a good default for a marketplace where
// listings don't change second-to-second.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Catches errors ErrorBoundary can't (things outside React's render cycle -
// event handlers, timers, rejected promises)
window.addEventListener('error', (event) => {
  reportClientError({
    message: event.message,
    stack: event.error?.stack,
    path: window.location.pathname,
  });
});

window.addEventListener('unhandledrejection', (event) => {
  reportClientError({
    message: event.reason?.message || String(event.reason),
    stack: event.reason?.stack,
    path: window.location.pathname,
  });
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider>
            <AuthProvider>
              <CartProvider>
                <App />
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
