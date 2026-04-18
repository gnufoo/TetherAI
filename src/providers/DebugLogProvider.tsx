import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';
type LogCategory = 'wdk' | 'qvac' | 'network' | 'navigation' | 'app' | 'error';

export type LogEntry = {
  id: string;
  timestamp: number;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: any;
};

interface DebugLogContextValue {
  logs: LogEntry[];
  log: (message: string, category?: LogCategory, level?: LogLevel, data?: any) => void;
  clear: () => void;
  exportLogs: () => string;
}

const MAX_ENTRIES = 500;

const DebugLogContext = createContext<DebugLogContextValue>({
  logs: [],
  log: () => {},
  clear: () => {},
  exportLogs: () => '',
});

export function useDebugLog() {
  return useContext(DebugLogContext);
}

let _globalLog: DebugLogContextValue['log'] | null = null;

/** Call from outside React tree (e.g. providers that mount later). */
export function debugLog(
  message: string,
  category: LogCategory = 'app',
  level: LogLevel = 'info',
  data?: any,
) {
  _globalLog?.(message, category, level, data);
}

export default function DebugLogProvider({ children }: { children: React.ReactNode }) {
  const appStartRef = useRef(Date.now());
  const logsRef = useRef<LogEntry[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const idCounter = useRef(0);

  const log = useCallback(
    (message: string, category: LogCategory = 'app', level: LogLevel = 'info', data?: any) => {
      const entry: LogEntry = {
        id: `log-${++idCounter.current}`,
        timestamp: Date.now() - appStartRef.current,
        level,
        category,
        message,
        data,
      };
      logsRef.current = [...logsRef.current.slice(-(MAX_ENTRIES - 1)), entry];
      setLogs(logsRef.current);
    },
    [],
  );

  const clear = useCallback(() => {
    logsRef.current = [];
    setLogs([]);
  }, []);

  const exportLogs = useCallback(() => {
    return logsRef.current
      .map(
        (e) =>
          `[+${(e.timestamp / 1000).toFixed(1)}s] [${e.category}] [${e.level}] ${e.message}${e.data ? ' ' + JSON.stringify(e.data) : ''}`,
      )
      .join('\n');
  }, []);

  // Install interceptors once on mount
  useEffect(() => {
    _globalLog = log;

    // ── 1. Console interceptor ──
    const origLog = console.log;
    const origWarn = console.warn;
    const origError = console.error;

    const stringify = (...args: any[]) =>
      args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');

    console.log = (...args: any[]) => {
      log(stringify(...args), 'app', 'debug');
      origLog.apply(console, args);
    };
    console.warn = (...args: any[]) => {
      log(stringify(...args), 'app', 'warn');
      origWarn.apply(console, args);
    };
    console.error = (...args: any[]) => {
      log(stringify(...args), 'app', 'error');
      origError.apply(console, args);
    };

    // ── 2. Global error handler ──
    const previousHandler = (global as any).ErrorUtils?.getGlobalHandler?.();
    (global as any).ErrorUtils?.setGlobalHandler?.(
      (error: any, isFatal: boolean) => {
        log(
          `${isFatal ? 'FATAL' : 'ERROR'}: ${error?.message ?? error}`,
          'error',
          'error',
          { stack: error?.stack },
        );
        previousHandler?.(error, isFatal);
      },
    );

    // ── 3. Unhandled promise rejection (RN polyfill-style) ──
    const origRejectionTracking = (global as any).HermesInternal?.enablePromiseRejectionTracker;
    if (origRejectionTracking) {
      origRejectionTracking({
        allRejections: true,
        onUnhandled: (_id: number, rejection: any) => {
          log(
            `Unhandled rejection: ${rejection?.message ?? rejection}`,
            'error',
            'error',
          );
        },
      });
    }

    // ── 4. Network interceptor ──
    const originalFetch = global.fetch;
    global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : (input as Request).url;
      const method = init?.method || 'GET';
      const t0 = Date.now();
      log(`${method} ${url}`, 'network', 'debug');
      try {
        const response = await originalFetch(input, init);
        log(
          `${method} ${url} → ${response.status} (${Date.now() - t0}ms)`,
          'network',
          response.ok ? 'info' : 'warn',
        );
        return response;
      } catch (e: any) {
        log(
          `${method} ${url} → FAILED: ${e?.message ?? e} (${Date.now() - t0}ms)`,
          'network',
          'error',
        );
        throw e;
      }
    };

    return () => {
      console.log = origLog;
      console.warn = origWarn;
      console.error = origError;
      global.fetch = originalFetch;
      _globalLog = null;
      if (previousHandler) {
        (global as any).ErrorUtils?.setGlobalHandler?.(previousHandler);
      }
    };
  }, [log]);

  return (
    <DebugLogContext.Provider value={{ logs, log, clear, exportLogs }}>
      {children}
    </DebugLogContext.Provider>
  );
}
