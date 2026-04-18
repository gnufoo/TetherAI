import type { ChainId } from './mock-types';

export type Contact = {
  id: string;
  name: string;
  chain: ChainId;
  address: string;
  note?: string;
  avatar?: string;
};

export const addressBook: Contact[] = [
  {
    id: 'c-mom',
    name: 'Mom',
    chain: 'polygon',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0BeB0',
    avatar: '💐',
  },
  {
    id: 'c-alice',
    name: 'Alice',
    chain: 'polygon',
    address: '0xAbC123dEf456789aBcDeF0123456789AbCDeF012',
    avatar: '🌸',
  },
  {
    id: 'c-bob',
    name: 'Bob Merchant',
    chain: 'tron',
    address: 'TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax',
    note: 'Corner shop',
    avatar: '🛒',
  },
  {
    id: 'c-coffee',
    name: 'Coffee Shop',
    chain: 'polygon',
    address: '0x9999888877776666555544443333222211110000',
    avatar: '☕',
  },
  {
    id: 'c-john',
    name: 'Cousin John',
    chain: 'lightning',
    address: 'lnbc1p3xnhl2pp5jptserfjdssfgyr2q8sdsy8…',
    avatar: '⚡',
  },
];

const aliases: Record<string, string> = {
  mom: 'c-mom',
  mommy: 'c-mom',
  mum: 'c-mom',
  mother: 'c-mom',
  alice: 'c-alice',
  bob: 'c-bob',
  'bob merchant': 'c-bob',
  'the merchant': 'c-bob',
  merchant: 'c-bob',
  'coffee shop': 'c-coffee',
  coffee: 'c-coffee',
  'the coffee shop': 'c-coffee',
  'cousin john': 'c-john',
  john: 'c-john',
  cousin: 'c-john',
};

export function findContact(query: string): Contact | null {
  if (!query) return null;
  const q = query.toLowerCase().trim();

  if (aliases[q]) return addressBook.find((c) => c.id === aliases[q]) ?? null;

  for (const c of addressBook) {
    if (c.name.toLowerCase().includes(q) || q.includes(c.name.toLowerCase())) {
      return c;
    }
  }
  return null;
}

export function verifyAddress(address: string): Contact | null {
  return addressBook.find((c) => c.address === address) ?? null;
}
