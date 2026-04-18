export type ChainId =
  | 'btc'
  | 'ton'
  | 'ethereum'
  | 'polygon'
  | 'arbitrum'
  | 'tron'
  | 'lightning';

export type Address = {
  chain: ChainId;
  address: string;
  derivationPath: string;
};

export type Balance = {
  chain: ChainId;
  native: { symbol: string; amount: string; usd: number };
  tokens: { symbol: string; amount: string; usd: number; contract?: string }[];
};

export type Wallet = {
  created: string;
  mnemonic: string;
  addresses: Address[];
  balances: Balance[];
};

export type TxDraft = {
  toName?: string;
  toAddress: string;
  chain: ChainId;
  token: string;
  amount: string;
  amountUsd: number;
  fee: { amount: string; symbol: string; usd: number };
  memo?: string;
  rail: 'polygon' | 'lightning';
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
  action?:
    | { kind: 'show_balance' }
    | { kind: 'propose_send'; draft: TxDraft }
    | { kind: 'show_receive'; chain: ChainId }
    | { kind: 'clarify'; question: string };
};

export type AgentState = {
  modelName: string;
  modelSize: string;
  loaded: boolean;
  loading: boolean;
  loadProgress: number;
  tokensPerSec: number | null;
};
