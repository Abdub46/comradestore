import React from 'react';
import { reportClientError } from '../services/errorLogService';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    reportClientError({
      message: error?.message || 'Unknown React render error',
      stack: `${error?.stack || ''}\n${info?.componentStack || ''}`,
      path: window.location.pathname,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
          <p className="text-sm text-gray-500 mb-4">
            We've logged this issue. Try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-md hover:bg-primary-700"
          >
            Refresh
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}