import React, { useState, useEffect } from 'react';
import { apiTester } from '../services/api-tester.js';
import { configValidator } from '../services/config-validator.js';

const ApiTestComponent = () => {
  const [testResults, setTestResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [configStatus, setConfigStatus] = useState(null);

  useEffect(() => {
    // Validate configuration on component mount
    const validation = configValidator.validateAll();
    setConfigStatus(validation);
  }, []);

  const runTests = async () => {
    setIsLoading(true);
    try {
      const results = await apiTester.testAllApis();
      setTestResults(results);
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return '⏳';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'var(--success)';
      case 'error': return 'var(--error)';
      case 'warning': return 'var(--warning)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className="api-test-component">
      <div className="page-header">
        <h1>API Configuration Test</h1>
        <p>Test all API endpoints and validate configuration</p>
      </div>

      {/* Configuration Status */}
      <div className="card">
        <h3>Configuration Status</h3>
        {configStatus && (
          <div className="config-status">
            <div style={{ 
              color: configStatus.isValid ? 'var(--success)' : 'var(--error)',
              fontWeight: 'var(--font-weight-semibold)',
              marginBottom: 'var(--space-3)'
            }}>
              {getStatusIcon(configStatus.isValid ? 'success' : 'error')} 
              {configStatus.isValid ? 'Configuration Valid' : 'Configuration Issues Detected'}
            </div>
            
            {configStatus.errors.length > 0 && (
              <div className="error-list">
                <h4>Errors:</h4>
                <ul>
                  {configStatus.errors.map((error, index) => (
                    <li key={index} style={{ color: 'var(--error)' }}>❌ {error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {configStatus.warnings.length > 0 && (
              <div className="warning-list">
                <h4>Warnings:</h4>
                <ul>
                  {configStatus.warnings.map((warning, index) => (
                    <li key={index} style={{ color: 'var(--warning)' }}>⚠️ {warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Test Controls */}
      <div className="card">
        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
          <button 
            className="btn btn-primary" 
            onClick={runTests}
            disabled={isLoading}
          >
            {isLoading ? 'Testing APIs...' : 'Test All APIs'}
          </button>
          
          {isLoading && (
            <div className="loading" style={{ padding: 'var(--space-2)', margin: 0 }}>
              Running tests...
            </div>
          )}
        </div>
      </div>

      {/* Test Results */}
      {testResults && (
        <div className="card">
          <h3>Test Results</h3>
          
          <div className="test-summary" style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{ 
              display: 'flex', 
              gap: 'var(--space-6)', 
              marginBottom: 'var(--space-4)',
              flexWrap: 'wrap'
            }}>
              <div className="stat-item">
                <span className="stat-value">{testResults.overall.passedTests}</span>
                <span className="stat-label">Passed</span>
              </div>
              <div className="stat-item">
                <span className="stat-value" style={{ color: 'var(--error)' }}>
                  {testResults.overall.failedTests}
                </span>
                <span className="stat-label">Failed</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{testResults.overall.totalTests}</span>
                <span className="stat-label">Total</span>
              </div>
            </div>
            
            <div style={{ 
              color: testResults.overall.allPassed ? 'var(--success)' : 'var(--warning)',
              fontWeight: 'var(--font-weight-semibold)'
            }}>
              {getStatusIcon(testResults.overall.allPassed ? 'success' : 'warning')} 
              {testResults.overall.allPassed ? 'All APIs Working' : 'Some APIs Need Attention'}
            </div>
          </div>

          <div className="api-test-results">
            {Object.entries(testResults.testResults).map(([apiName, result]) => (
              <div key={apiName} className="api-result-card">
                <div className="api-result-header">
                  <h4 style={{ 
                    color: getStatusColor(result.status),
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    textTransform: 'capitalize'
                  }}>
                    {getStatusIcon(result.status)} {apiName}
                  </h4>
                  <small style={{ color: 'var(--text-tertiary)' }}>
                    {result.timestamp ? new Date(result.timestamp).toLocaleTimeString() : 'Not tested'}
                  </small>
                </div>
                
                <p style={{ 
                  color: 'var(--text-secondary)',
                  marginTop: 'var(--space-2)'
                }}>
                  {result.message || 'No message available'}
                </p>
                
                {result.details && (
                  <div className="api-details" style={{ 
                    marginTop: 'var(--space-3)',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text-tertiary)'
                  }}>
                    <details>
                      <summary style={{ cursor: 'pointer' }}>View Details</summary>
                      <pre style={{ 
                        background: 'var(--neutral-grey-100)',
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        marginTop: 'var(--space-2)',
                        overflow: 'auto'
                      }}>
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .api-test-component {
          max-width: 800px;
          margin: 0 auto;
          padding: var(--space-4);
        }
        
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        
        .stat-value {
          font-size: var(--font-size-2xl);
          font-weight: var(--font-weight-bold);
          color: var(--success);
          line-height: var(--line-height-tight);
        }
        
        .stat-label {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .api-result-card {
          background: var(--neutral-grey-50);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          margin-bottom: var(--space-4);
          border: 1px solid var(--neutral-grey-200);
        }
        
        .api-result-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--space-3);
        }
        
        .error-list ul,
        .warning-list ul {
          margin: var(--space-2) 0;
          padding-left: var(--space-5);
        }
        
        .error-list li,
        .warning-list li {
          margin-bottom: var(--space-1);
        }
      `}</style>
    </div>
  );
};

export default ApiTestComponent;