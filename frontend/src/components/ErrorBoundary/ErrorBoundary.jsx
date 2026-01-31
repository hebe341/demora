import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    // Log erro para monitoramento
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-red-600">❌ Oops!</h1>
              <p className="text-gray-600 mt-2">
                Algo deu errado. Por favor, tente novamente.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4 p-3 bg-gray-100 rounded text-sm text-gray-700 max-h-32 overflow-auto">
                <summary className="cursor-pointer font-semibold mb-2">
                  Detalhes do Erro (Dev Only)
                </summary>
                <p className="text-xs font-mono">{this.state.error.toString()}</p>
                {this.state.errorInfo && (
                  <pre className="text-xs mt-2 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}

            <button
              onClick={this.resetError}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
            >
              Tentar Novamente
            </button>

            <button
              onClick={() => window.location.href = '/'}
              className="w-full mt-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded transition"
            >
              Voltar para Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
