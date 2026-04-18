import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { useQVAC } from '@/providers/QVACProvider';
import { mockWallet, primaryUsdt, totalUsd } from '@/services/mock-wallet';
import { addressBook } from '@/services/mock-address-book';
import type { AgentState, ChatMessage, TxDraft } from '@/services/mock-types';
import ContactsSheet from '@/components/ContactsSheet';

export default function EdgeAIScreen() {
  const insets = useSafeAreaInsets();
  const { agentState: agent, chat, loadModel } = useQVAC();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'sys-1',
      role: 'assistant',
      content:
        "Hi — I'm your wallet assistant. Try: 'Send 20 USDT to Mom' or 'Check my balance'. All inference runs on this phone.",
      createdAt: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const contactsRef = useRef<BottomSheet>(null);

  useEffect(() => {
    if (!agent.loaded && !agent.loading) {
      loadModel();
    }
  }, [agent.loaded, agent.loading, loadModel]);

  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    return () => clearTimeout(t);
  }, [messages, streaming]);

  const send = useCallback(async () => {
    const q = input.trim();
    if (!q || sending) return;
    setInput('');
    setSending(true);
    setMessages((m) => [
      ...m,
      { id: `u-${Date.now()}`, role: 'user' as const, content: q, createdAt: Date.now() },
    ]);
    setStreaming('');
    let buf = '';
    await chat(
      q,
      (tok) => {
        buf += tok;
        setStreaming(buf);
      },
      (finalMsg) => {
        setStreaming('');
        setMessages((m) => [...m, finalMsg]);
      },
    );
    setSending(false);
  }, [input, sending, chat]);

  const openContacts = useCallback(() => contactsRef.current?.expand(), []);

  const handleContactPick = useCallback((contact: { name: string }) => {
    setInput(`Send 20 USDT to ${contact.name}`);
    contactsRef.current?.close();
  }, []);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <ChatHeader agent={agent} onContacts={openContacts} onLoadModel={loadModel} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={s.chatContent}
          keyboardShouldPersistTaps="handled"
        >
          <QuickGlance onContacts={openContacts} />
          {messages.map((m) => (
            <Bubble key={m.id} msg={m} />
          ))}
          {streaming !== '' && (
            <Bubble
              msg={{
                id: 'streaming',
                role: 'assistant',
                content: streaming,
                createdAt: Date.now(),
              }}
            />
          )}
        </ScrollView>
        <Composer value={input} onChange={setInput} onSend={send} disabled={sending} />
      </KeyboardAvoidingView>
      <ContactsSheet ref={contactsRef} onPick={handleContactPick} />
    </View>
  );
}

/* -- Header ------------------------------------------------------------ */

function ChatHeader({
  agent,
  onContacts,
  onLoadModel,
}: {
  agent: AgentState;
  onContacts: () => void;
  onLoadModel: () => void;
}) {
  return (
    <View style={s.header}>
      <View style={s.headerLeft}>
        <View style={s.headerLogo}>
          <Text style={s.headerLogoT}>T</Text>
        </View>
        <View>
          <Text style={s.headerTitle}>Transcend</Text>
          <Text style={s.headerSub}>QVAC · WDK · on-device</Text>
        </View>
      </View>
      <View style={s.headerRight}>
        <TouchableOpacity onPress={onContacts} style={s.contactsChip} activeOpacity={0.7}>
          <Text style={s.contactsChipText}>👥 {addressBook.length}</Text>
        </TouchableOpacity>
        <ModelChip agent={agent} onLoadModel={onLoadModel} />
      </View>
    </View>
  );
}

function ModelChip({ agent, onLoadModel }: { agent: AgentState; onLoadModel: () => void }) {
  const handlePress = () => {
    if (!agent.loaded && !agent.loading) onLoadModel();
  };

  const label = agent.loading
    ? `Loading ${Math.round(agent.loadProgress * 100)}%`
    : agent.loaded
      ? `${agent.modelName} · ${agent.tokensPerSec} t/s`
      : 'Load model';

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[s.modelChip, agent.loaded ? s.modelChipOn : s.modelChipOff]}
      activeOpacity={0.7}
    >
      <PulseDot color={agent.loaded ? colors.tetherGreen : '#f59e0b'} />
      <Text style={[s.modelChipLabel, agent.loaded ? s.modelChipLabelOn : s.modelChipLabelOff]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function PulseDot({ color }: { color: string }) {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    ).start();
  }, [opacity]);
  return (
    <Animated.View
      style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color, opacity }}
    />
  );
}

/* -- Balance glance ---------------------------------------------------- */

function QuickGlance({ onContacts }: { onContacts: () => void }) {
  const total = totalUsd();
  const usdt = primaryUsdt();
  return (
    <View style={s.glance}>
      <Text style={s.glanceLabel}>TOTAL BALANCE</Text>
      <View style={s.glanceAmountRow}>
        <Text style={s.glanceAmount}>${total.toFixed(2)}</Text>
        <Text style={s.glanceCurrency}>USD</Text>
      </View>
      <Text style={s.glanceDetail}>{usdt.amount} USDT on Polygon · ready to send</Text>
      <View style={s.glanceActions}>
        <TouchableOpacity style={s.glanceBtn} activeOpacity={0.7}>
          <Text style={s.glanceBtnText}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.glanceBtn} activeOpacity={0.7}>
          <Text style={s.glanceBtnText}>Receive</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.glanceBtn} onPress={onContacts} activeOpacity={0.7}>
          <Text style={s.glanceBtnText}>Contacts</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* -- Chat bubbles ------------------------------------------------------ */

function Bubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <View style={[s.bubbleRow, isUser ? s.bubbleRowR : s.bubbleRowL]}>
      <View style={[s.bubble, isUser ? s.bubbleUser : s.bubbleAssistant]}>
        <Text style={[s.bubbleText, isUser ? s.bubbleTextUser : s.bubbleTextAssistant]}>
          {msg.content}
        </Text>
        {msg.action?.kind === 'propose_send' && <SendDraftCard draft={msg.action.draft} />}
        {msg.action?.kind === 'show_receive' && <ReceiveCard />}
      </View>
    </View>
  );
}

function SendDraftCard({ draft }: { draft: TxDraft }) {
  const [sent, setSent] = useState(false);
  const railLabel = draft.rail === 'lightning' ? '⚡ Lightning · instant' : 'Polygon · ~2s';

  return (
    <View style={s.card}>
      <Text style={s.cardLabel}>PROPOSED TRANSACTION · AI-DRAFTED, YOU APPROVE</Text>
      <DraftRow label="Amount" value={`$${draft.amountUsd.toFixed(2)} USDT`} />
      <DraftRow label="To" value={draft.toName ?? 'Unknown'} />
      <DraftRow
        label="Address"
        value={`${draft.toAddress.slice(0, 8)}…${draft.toAddress.slice(-4)}`}
        mono
      />
      <DraftRow label="Rail" value={railLabel} />
      <DraftRow label="Fee" value={`$${draft.fee.usd.toFixed(3)}`} />
      {sent ? (
        <View style={s.sentBadge}>
          <Text style={s.sentBadgeText}>
            ✓ Sent via {draft.rail === 'lightning' ? 'Lightning' : 'Polygon'}
          </Text>
        </View>
      ) : (
        <View style={s.cardBtns}>
          <TouchableOpacity style={s.cardEditBtn} activeOpacity={0.7}>
            <Text style={s.cardEditBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.cardApproveBtn}
            onPress={() => setSent(true)}
            activeOpacity={0.7}
          >
            <Text style={s.cardApproveBtnText}>Approve & Send</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function DraftRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={s.draftRow}>
      <Text style={s.draftRowLabel}>{label}</Text>
      <Text style={[s.draftRowValue, mono && s.mono]}>{value}</Text>
    </View>
  );
}

function ReceiveCard() {
  const addr = mockWallet.addresses.find((a) => a.chain === 'polygon')!.address;
  return (
    <View style={s.card}>
      <Text style={s.cardLabel}>POLYGON ADDRESS · USDT-COMPATIBLE</Text>
      <View style={s.qrMock}>
        <Text style={s.qrMockText}>[QR CODE MOCK]</Text>
      </View>
      <Text style={[s.receiveAddr, s.mono]}>{addr}</Text>
      <TouchableOpacity style={s.copyBtn} activeOpacity={0.7}>
        <Text style={s.copyBtnText}>Copy address</Text>
      </TouchableOpacity>
    </View>
  );
}

/* -- Composer ---------------------------------------------------------- */

function Composer({
  value,
  onChange,
  onSend,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled: boolean;
}) {
  const suggestions = [
    'Send 20 USDT to Mom',
    'Pay 10 to the Coffee Shop',
    'Send 5 to Cousin John',
    'Check my balance',
  ];

  return (
    <View style={s.composer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.suggestionsRow}
      >
        {suggestions.map((t) => (
          <TouchableOpacity
            key={t}
            style={s.suggestionChip}
            onPress={() => onChange(t)}
            activeOpacity={0.7}
          >
            <Text style={s.suggestionText}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={s.inputRow}>
        <View style={s.inputBox}>
          <TextInput
            value={value}
            onChangeText={onChange}
            onSubmitEditing={onSend}
            placeholder={disabled ? 'Thinking...' : 'Ask your wallet...'}
            placeholderTextColor={colors.textSecondary}
            style={s.input}
            returnKeyType="send"
            editable={!disabled}
          />
        </View>
        <TouchableOpacity
          style={[s.sendBtn, (!value.trim() || disabled) && s.sendBtnOff]}
          onPress={onSend}
          disabled={disabled || !value.trim()}
          activeOpacity={0.7}
        >
          <Text style={[s.sendBtnText, (!value.trim() || disabled) && s.sendBtnTextOff]}>↑</Text>
        </TouchableOpacity>
      </View>
      <PoweredBy />
    </View>
  );
}

function PoweredBy() {
  return (
    <View style={s.powered}>
      <Text style={s.poweredLabel}>POWERED BY</Text>
      <View style={s.poweredRow}>
        <Text style={s.poweredBrand}>QVAC</Text>
        <Text style={s.poweredDot}>·</Text>
        <Text style={s.poweredBrand}>WDK</Text>
      </View>
    </View>
  );
}

/* -- Styles ------------------------------------------------------------ */

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  chatContent: { padding: 16, gap: 12, paddingBottom: 8 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerLogo: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.tetherGreenFaded,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLogoT: { color: colors.tetherGreen, fontSize: 14, fontWeight: '700' },
  headerTitle: { color: colors.text, fontSize: 14, fontWeight: '600' },
  headerSub: { color: colors.textSecondary, fontSize: 10 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  contactsChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  contactsChipText: { fontSize: 10, color: colors.textSecondary },

  modelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  modelChipOn: { borderColor: colors.tetherGreenBorder, backgroundColor: colors.tetherGreenFaded },
  modelChipOff: { borderColor: colors.border, backgroundColor: colors.card },
  modelChipLabel: { fontSize: 10 },
  modelChipLabelOn: { color: colors.tetherGreen },
  modelChipLabelOff: { color: colors.textSecondary },

  glance: {
    borderRadius: 16,
    backgroundColor: colors.tetherGreenFaded,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  glanceLabel: { fontSize: 11, color: colors.textSecondary, letterSpacing: 1 },
  glanceAmountRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  glanceAmount: { fontSize: 24, fontWeight: '700', color: colors.text },
  glanceCurrency: { fontSize: 14, color: colors.textSecondary, marginLeft: 8 },
  glanceDetail: { fontSize: 12, color: colors.tetherGreen, marginTop: 4 },
  glanceActions: { flexDirection: 'row', gap: 8, marginTop: 16 },
  glanceBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  glanceBtnText: { fontSize: 12, fontWeight: '500', color: colors.text },

  bubbleRow: { flexDirection: 'row' },
  bubbleRowR: { justifyContent: 'flex-end' },
  bubbleRowL: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '85%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16 },
  bubbleUser: { backgroundColor: colors.tetherGreen, borderBottomRightRadius: 4 },
  bubbleAssistant: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextUser: { color: colors.black },
  bubbleTextAssistant: { color: colors.text },

  card: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  cardLabel: { fontSize: 10, color: colors.textSecondary, letterSpacing: 0.5, marginBottom: 8 },
  draftRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  draftRowLabel: { fontSize: 12, color: colors.textSecondary },
  draftRowValue: { fontSize: 12, fontWeight: '600', color: colors.text },
  cardBtns: { flexDirection: 'row', gap: 8, marginTop: 12 },
  cardEditBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cardEditBtnText: { fontSize: 12, color: colors.text },
  cardApproveBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.tetherGreen,
    alignItems: 'center',
  },
  cardApproveBtnText: { fontSize: 12, fontWeight: '600', color: colors.black },
  sentBadge: {
    marginTop: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.tetherGreenFaded,
    alignItems: 'center',
  },
  sentBadgeText: { fontSize: 12, fontWeight: '600', color: colors.tetherGreen },

  qrMock: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.white,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  qrMockText: {
    color: colors.black,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 10,
  },
  receiveAddr: { fontSize: 10, color: colors.textSecondary, marginTop: 8 },
  copyBtn: {
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  copyBtnText: { fontSize: 12, color: colors.text },
  mono: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 10 },

  composer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 16,
  },
  suggestionsRow: { gap: 8, marginBottom: 8 },
  suggestionChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionText: { fontSize: 11, color: colors.textSecondary },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  inputBox: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: { fontSize: 14, color: colors.text, padding: 0 },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.tetherGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnOff: { backgroundColor: colors.card, opacity: 0.3 },
  sendBtnText: { fontSize: 18, fontWeight: '700', color: colors.black },
  sendBtnTextOff: { color: colors.textSecondary },

  powered: { alignItems: 'center', marginTop: 8, gap: 2 },
  poweredLabel: { fontSize: 10, color: colors.textSecondary, letterSpacing: 2 },
  poweredRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  poweredBrand: { fontSize: 11, fontWeight: '600', color: colors.tetherGreen },
  poweredDot: { fontSize: 11, color: colors.textSecondary },
});
