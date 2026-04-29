import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  chat as qvacChat,
  loadModel,
  onAgentState,
} from '@/services/qvac-engine';
import { chat as mockChat } from '@/services/mock-qvac';
import { debugLog } from './DebugLogProvider';
import type { AgentState, ChatMessage } from '@/services/mock-types';

interface QVACContextValue {
  agentState: AgentState;
  chat: (
    input: string,
    onToken: (t: string) => void,
    onFinish: (msg: ChatMessage) => void,
  ) => Promise<void>;
  loadModel: () => Promise<void>;
}

const defaultState: AgentState = {
  modelName: 'Llama 3.2 1B',
  modelSize: '770 MB',
  loaded: false,
  loading: false,
  loadProgress: 0,
  tokensPerSec: null,
};

const QVACContext = createContext<QVACContextValue>({
  agentState: defaultState,
  chat: async () => {},
  loadModel: async () => {},
});

export function useQVAC() {
  return useContext(QVACContext);
}

export default function QVACProvider({ children }: { children: React.ReactNode }) {
  const [agentState, setAgentState] = useState<AgentState>(defaultState);
  const stateRef = useRef(agentState);

  useEffect(() => {
    stateRef.current = agentState;
  }, [agentState]);

  // Subscribe to agent state changes
  useEffect(() => {
    return onAgentState((s) => {
      setAgentState(s);
      if (s.loading) {
        debugLog(
          `Model loading ${Math.round(s.loadProgress * 100)}%`,
          'qvac',
          'debug',
        );
      }
    });
  }, []);

  const doLoadModel = useCallback(async () => {
    debugLog('Starting model load', 'qvac', 'info');
    const timeout = new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error('Model load timed out after 120s')), 120_000),
    );
    try {
      await Promise.race([loadModel(true), timeout]);
      if (stateRef.current.loaded) {
        debugLog('Model loaded successfully', 'qvac', 'info');
      } else {
        debugLog('QVAC embedded model disabled/unavailable — using parser fallback', 'qvac', 'warn');
      }
    } catch (e: any) {
      debugLog(`Model load failed: ${e?.message ?? e}`, 'qvac', 'error');
    }
  }, []);

  const doChat = useCallback(
    async (
      input: string,
      onToken: (t: string) => void,
      onFinish: (msg: ChatMessage) => void,
    ) => {
      const chatFn = stateRef.current.loaded ? qvacChat : mockChat;
      if (!stateRef.current.loaded) {
        debugLog('Model not loaded — using mock parser fallback', 'qvac', 'warn');
      }
      try {
        await chatFn(input, onToken, onFinish);
      } catch (e: any) {
        debugLog(`Chat error: ${e?.message ?? e}`, 'qvac', 'error');
        onFinish({
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Something went wrong processing your request. Check the Debug tab for details.',
          createdAt: Date.now(),
        });
      }
    },
    [],
  );

  return (
    <QVACContext.Provider value={{ agentState, chat: doChat, loadModel: doLoadModel }}>
      {children}
    </QVACContext.Provider>
  );
}
