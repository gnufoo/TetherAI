import type { AgentState, ChatMessage, TxDraft } from './mock-types';
import { totalUsd, primaryUsdt } from './mock-wallet';
import { addressBook, findContact } from './mock-address-book';

let _counter = 0;
function uid(): string {
  return `msg-${Date.now().toString(36)}-${(++_counter).toString(36)}`;
}

let state: AgentState = {
  modelName: 'Llama 3.2 1B',
  modelSize: '770 MB',
  loaded: false,
  loading: false,
  loadProgress: 0,
  tokensPerSec: null,
};

type StateListener = (s: AgentState) => void;
const listeners: StateListener[] = [];

export function onAgentState(fn: StateListener) {
  listeners.push(fn);
  fn(state);
  return () => {
    const i = listeners.indexOf(fn);
    if (i >= 0) listeners.splice(i, 1);
  };
}

function setState(patch: Partial<AgentState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l(state));
}

export async function loadModel(fastForward = false) {
  if (state.loaded || state.loading) return;
  setState({ loading: true, loadProgress: 0 });
  const start = Date.now();
  const total = fastForward ? 2500 : 4000;
  while (Date.now() - start < total) {
    await new Promise((r) => setTimeout(r, 100));
    setState({ loadProgress: Math.min(1, (Date.now() - start) / total) });
  }
  setState({ loaded: true, loading: false, loadProgress: 1, tokensPerSec: 18 });
}

const NUMBER_WORDS: Record<string, number> = {
  five: 5,
  ten: 10,
  fifteen: 15,
  twenty: 20,
  thirty: 30,
  fifty: 50,
  hundred: 100,
  'a hundred': 100,
};

function parseAmount(s: string): number | null {
  const m = s.match(/(\d+(?:\.\d+)?)/);
  if (m) return parseFloat(m[1]);
  for (const [w, n] of Object.entries(NUMBER_WORDS)) {
    if (s.toLowerCase().includes(w)) return n;
  }
  return null;
}

function extractNameCandidate(s: string): string | null {
  const patterns = [
    /to\s+(?:the\s+|my\s+)?(.+?)(?:\s+on\s+\w+)?\s*$/i,
    /pay\s+(.+?)\s+\d/i,
    /give\s+(.+?)\s+\d/i,
    /send\s+(.+?)\s+\d+\s*(?:usdt|dollars|usd|bucks)?/i,
  ];
  for (const p of patterns) {
    const m = s.match(p);
    if (m && m[1]) return m[1].trim().replace(/^(the|my)\s+/, '');
  }
  return null;
}

function pickRail(contact: { chain: string }): 'polygon' | 'lightning' {
  if (contact.chain === 'lightning') return 'lightning';
  return 'polygon';
}

function buildDraft(
  amount: number,
  contactName: string,
): { draft?: TxDraft; clarify?: string } {
  const c = findContact(contactName);
  if (!c) {
    return {
      clarify: `I don't have "${contactName}" in your address book. Add them first, or paste an address.`,
    };
  }
  const rail = pickRail(c);
  return {
    draft: {
      toName: c.name,
      toAddress: c.address,
      chain: rail,
      token: 'USDT',
      amount: amount.toFixed(2),
      amountUsd: amount,
      fee:
        rail === 'lightning'
          ? { amount: '0.0000015', symbol: 'BTC', usd: 0.0009 }
          : { amount: '0.02', symbol: 'MATIC', usd: 0.014 },
      rail,
    },
  };
}

type ParsedIntent =
  | { kind: 'balance' }
  | { kind: 'send'; amount?: number | null; name?: string | null }
  | { kind: 'receive' }
  | { kind: 'contacts' }
  | { kind: 'explain' }
  | { kind: 'chat' };

function parseIntent(q: string): ParsedIntent {
  const s = q.toLowerCase();
  if (/balance|how much|wallet total|show.*money/.test(s)) return { kind: 'balance' };
  if (/contact|address book|who.*can.*send/.test(s)) return { kind: 'contacts' };
  if (/send|transfer|pay|give/.test(s)) {
    return { kind: 'send', amount: parseAmount(s), name: extractNameCandidate(q) };
  }
  if (/receive|deposit|my address/.test(s)) return { kind: 'receive' };
  if (/what.*transcend|about.*wallet|help|how.*work/.test(s)) return { kind: 'explain' };
  return { kind: 'chat' };
}

export async function chat(
  input: string,
  onToken: (t: string) => void,
  onFinish: (msg: ChatMessage) => void,
) {
  if (!state.loaded) {
    const msg = "Model isn't loaded yet. Tap the model chip at the top to load.";
    for (const w of msg.split(' ')) {
      await new Promise((r) => setTimeout(r, 25));
      onToken(w + ' ');
    }
    onFinish({ id: uid(), role: 'assistant', content: msg, createdAt: Date.now() });
    return;
  }

  const intent = parseIntent(input);
  let text = '';
  let action: ChatMessage['action'] | undefined;

  switch (intent.kind) {
    case 'balance': {
      const total = totalUsd();
      const u = primaryUsdt();
      text = `You hold about $${total.toFixed(0)} total. Your main spending pool is ${u.amount} USDT on Polygon — low fees, instant.`;
      action = { kind: 'show_balance' };
      break;
    }
    case 'contacts': {
      text = `You have ${addressBook.length} contacts: ${addressBook.map((c) => c.name).join(', ')}. Say "send 20 USDT to Mom" to pay any of them.`;
      break;
    }
    case 'send': {
      if (!intent.amount) {
        text = 'How much would you like to send?';
        action = { kind: 'clarify', question: 'amount' };
      } else if (!intent.name) {
        text = 'Who should I send it to?';
        action = { kind: 'clarify', question: 'recipient' };
      } else {
        const { draft, clarify } = buildDraft(intent.amount, intent.name);
        if (draft) {
          const rail =
            draft.rail === 'lightning'
              ? 'over Lightning — near-instant, sub-cent fee'
              : 'on Polygon — low fee, quick settlement';
          text = `Send $${intent.amount.toFixed(2)} USDT to ${draft.toName} ${rail}. Review and approve below.`;
          action = { kind: 'propose_send', draft };
        } else {
          text = clarify!;
          action = { kind: 'clarify', question: clarify! };
        }
      }
      break;
    }
    case 'receive': {
      text =
        "Here's your Polygon address for receiving USDT. You can also receive via Lightning for instant zero-fee transfers.";
      action = { kind: 'show_receive', chain: 'polygon' };
      break;
    }
    case 'explain': {
      text =
        'Transcend is your on-device Tether wallet. Keys stay on this phone. The AI runs locally — no cloud, no network needed for inference. USDT works best on Polygon for low fees, or Lightning for instant sends.';
      break;
    }
    default:
      text =
        'I can help with your wallet — check balance, send USDT to a contact, show your contacts, or get a receive address.';
  }

  const words = text.split(' ');
  for (const w of words) {
    await new Promise((r) => setTimeout(r, 30 + Math.random() * 30));
    onToken(w + ' ');
  }
  onFinish({ id: uid(), role: 'assistant', content: text, createdAt: Date.now(), action });
}
