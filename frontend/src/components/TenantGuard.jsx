import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import Splash from './Splash';
import { ShieldAlert, ServerCrash, AlertCircle } from 'lucide-react';

const CACHE_KEY = 'tenant_validation_cache';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

function DomainNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10 text-rose-600 dark:text-rose-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">404 Not Found</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-4">
          The requested family workspace could not be found. Please check the URL and try again.
        </p>
      </div>
    </div>
  );
}

function ServerUnavailable({ onRetry }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <ServerCrash className="w-10 h-10 text-amber-600 dark:text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Service Unavailable</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          We are currently experiencing technical difficulties. Please try again in a few moments.
        </p>
        <button
          onClick={onRetry}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

export default function TenantGuard({ children }) {
  const [status, setStatus] = useState('loading'); // loading, valid, invalid, error

  const checkTenant = async () => {
    setStatus('loading');
    try {
      const hostname = window.location.hostname;
      
      const MAIN_DOMAINS = [
        "careertransform.in",
        "www.careertransform.in",
        "superadmin.careertransform.in",
        "api.careertransform.in",
        "localhost",
        "127.0.0.1",
        "familyhub.com",
        "brevolt.in",
        "www.brevolt.in",
        "13.204.75.91"
      ];

      if (MAIN_DOMAINS.includes(hostname) || hostname.includes('localhost:')) {
        setStatus('valid');
        return;
      }

      // 1. Check Cache
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { host, timestamp, isValid } = JSON.parse(cached);
          if (host === hostname && (Date.now() - timestamp) < CACHE_EXPIRY) {
            if (isValid) {
              setStatus('valid');
              return;
            } else {
              setStatus('invalid');
              return;
            }
          }
        } catch (e) {
          // Ignore cache parse error
        }
      }

      // 2. Fetch from Backend
      const response = await axios.get(`${API_BASE_URL}/api/tenant`, {
        params: { domain: hostname },
        // Prevent axios interceptors from redirecting to login on 401/403 for this call
        validateStatus: (status) => status < 500
      });

      if (response.status === 200) {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          host: hostname,
          timestamp: Date.now(),
          isValid: true
        }));
        setStatus('valid');
      } else if (response.status === 404) {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          host: hostname,
          timestamp: Date.now(),
          isValid: false
        }));
        setStatus('invalid');
      } else if (response.status === 401 || response.status === 403) {
        // Authentication errors should be ignored here, assume domain is valid if we get auth error
        setStatus('valid');
      } else {
        setStatus('error');
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          host: window.location.hostname,
          timestamp: Date.now(),
          isValid: false
        }));
        setStatus('invalid');
      } else {
        setStatus('error');
      }
    }
  };

  useEffect(() => {
    checkTenant();
  }, []);

  if (status === 'loading') {
    return <Splash onFinish={() => {}} />;
  }

  if (status === 'invalid') {
    return <DomainNotFound />;
  }

  if (status === 'error') {
    return <ServerUnavailable onRetry={checkTenant} />;
  }

  return children;
}
