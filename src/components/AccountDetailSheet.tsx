import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  Eye,
  EyeOff,
  Shield,
  CreditCard,
  Smartphone,
  Plus,
  Trash2,
  Share2,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  KeyRound,
  Edit,
  AlertTriangle,
} from 'lucide-react';
import { AccountRecord, SupportedLanguage, TransactionRecord } from '../types/account';
import { VirtualCard } from './VirtualCard';
import { BottomSheet } from './BottomSheet';
import { translations } from '../utils/i18n';
import { auditPinStrength, formatCurrency } from '../utils/validator';
import { generateTOTPCode } from '../utils/totp';

interface AccountDetailSheetProps {
  account: AccountRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (account: AccountRecord) => void;
  onDelete: (accountId: string) => void;
  onAddTransaction: (accountId: string, tx: Omit<TransactionRecord, 'id' | 'accountId'>) => void;
  onDeleteTransaction: (accountId: string, txId: string) => void;
  isVaultUnlocked: boolean;
  currentLanguage: SupportedLanguage;
}

export const AccountDetailSheet: React.FC<AccountDetailSheetProps> = ({
  account,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onAddTransaction,
  onDeleteTransaction,
  isVaultUnlocked,
  currentLanguage,
}) => {
  const t = translations[currentLanguage];

  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const [showAtmPin, setShowAtmPin] = useState(false);
  const [showMobilePin, setShowMobilePin] = useState(false);
  const [pinCountdown, setPinCountdown] = useState<number | null>(null);

  // New Transaction Form State
  const [showAddTx, setShowAddTx] = useState(false);
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [txCategory, setTxCategory] = useState('General');
  const [txNote, setTxNote] = useState('');

  // TOTP State
  const [totpData, setTotpData] = useState<{ code: string; secondsRemaining: number } | null>(null);

  // Ephemeral Share State
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Countdown timer for unmasked PIN (auto-remask after 10s)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showAtmPin || showMobilePin) {
      setPinCountdown(10);
      timer = setInterval(() => {
        setPinCountdown((prev) => {
          if (prev === null || prev <= 1) {
            setShowAtmPin(false);
            setShowMobilePin(false);
            clearInterval(timer);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setPinCountdown(null);
    }
    return () => clearInterval(timer);
  }, [showAtmPin, showMobilePin]);

  // Live TOTP code updates
  useEffect(() => {
    if (!account?.totp?.secret) return;
    const updateCode = async () => {
      const res = await generateTOTPCode(account.totp!.secret!);
      setTotpData(res);
    };
    updateCode();
    const interval = setInterval(updateCode, 1000);
    return () => clearInterval(interval);
  }, [account?.totp]);

  if (!account) return null;

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(35);
    }
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2000);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(txAmount);
    if (isNaN(num) || num <= 0) return;

    onAddTransaction(account.id, {
      amount: num,
      type: txType,
      category: txCategory.trim() || 'General',
      date: new Date().toISOString().split('T')[0],
      note: txNote.trim(),
    });

    setTxAmount('');
    setTxNote('');
    setShowAddTx(false);
  };

  const atmPinAudit = auditPinStrength(account.atm?.atmPin);
  const mobilePinAudit = auditPinStrength(account.mobileBanking?.mobileBankingPin);

  // Calculate account transaction totals
  const totalIncome = (account.transactions || [])
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = (account.transactions || [])
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Generate safe share payload (contains NO plain PINs per Security Law 1)
  const safeShareText = `Vault Secure Share:\nBank: ${account.orgName || 'N/A'}\nAccount: ${
    account.accountNumber
  }\nHolder: ${account.name}\nBranch: ${account.branchName || 'N/A'}\nPhone: ${
    account.phoneNumber
  }\n(Sensitive PINs withheld by Zero-Knowledge Policy)`;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={account.name}
      subtitle={`${account.orgName || 'Bank Vault'} • ${account.currency}`}
      maxHeight="max-h-[94vh]"
    >
      <div className="space-y-6 pb-6">
        {/* ================= 1. VIRTUAL CARD PREVIEW ================= */}
        <div>
          <VirtualCard
            account={account}
            isUnlocked={isVaultUnlocked}
            onCopy={(val, label) => handleCopy(val, label)}
          />
        </div>

        {/* ================= 2. QUICK ACTIONS BAR ================= */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleCopy(account.accountNumber, 'Account #')}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
          >
            {copiedLabel === 'Account #' ? (
              <Check className="w-4 h-4 text-emerald-400 mb-1" />
            ) : (
              <Copy className="w-4 h-4 text-slate-300 mb-1" />
            )}
            <span className="text-[10px] text-slate-400 font-mono">Account #</span>
            <span className="text-xs font-semibold text-slate-200 truncate w-full text-center">
              {account.accountNumber.slice(-6)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleCopy(account.phoneNumber, 'Phone')}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
          >
            {copiedLabel === 'Phone' ? (
              <Check className="w-4 h-4 text-emerald-400 mb-1" />
            ) : (
              <Smartphone className="w-4 h-4 text-slate-300 mb-1" />
            )}
            <span className="text-[10px] text-slate-400 font-mono">Phone</span>
            <span className="text-xs font-semibold text-slate-200 truncate w-full text-center">
              {account.phoneNumber}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
          >
            <Share2 className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="text-[10px] text-slate-400 font-mono">Share</span>
            <span className="text-xs font-semibold text-slate-200">Safe Clip</span>
          </button>
        </div>

        {/* ================= 3. ENCRYPTED PIN & CVV VAULT CONTROL ================= */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Cryptographic Credentials Vault
              </h4>
            </div>
            {pinCountdown !== null && (
              <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                <Clock className="w-3 h-3 animate-spin" />
                <span>Masking in {pinCountdown}s</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* ATM PIN */}
            {account.atm?.hasAtm && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-mono text-slate-400">ATM Card PIN</p>
                  <p className="text-base font-mono font-bold tracking-widest text-slate-100">
                    {showAtmPin ? account.atm.atmPin || '••••' : '••••'}
                  </p>
                  {atmPinAudit.warning && (
                    <p className="text-[10px] text-amber-400 flex items-center gap-1 mt-0.5">
                      <AlertTriangle className="w-3 h-3" />
                      {atmPinAudit.warning}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowAtmPin(!showAtmPin)}
                    aria-label="Toggle ATM PIN visibility"
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
                  >
                    {showAtmPin ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(account.atm.atmPin || '', 'ATM PIN')}
                    aria-label="Copy ATM PIN"
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
                  >
                    {copiedLabel === 'ATM PIN' ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Banking PIN */}
            {account.mobileBanking?.hasMobileBanking && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-mono text-slate-400">Mobile Banking PIN</p>
                  <p className="text-base font-mono font-bold tracking-widest text-slate-100">
                    {showMobilePin ? account.mobileBanking.mobileBankingPin || '••••' : '••••'}
                  </p>
                  {mobilePinAudit.warning && (
                    <p className="text-[10px] text-amber-400 flex items-center gap-1 mt-0.5">
                      <AlertTriangle className="w-3 h-3" />
                      {mobilePinAudit.warning}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowMobilePin(!showMobilePin)}
                    aria-label="Toggle Mobile Banking PIN visibility"
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
                  >
                    {showMobilePin ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(account.mobileBanking.mobileBankingPin || '', 'Mobile PIN')}
                    aria-label="Copy Mobile Banking PIN"
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
                  >
                    {copiedLabel === 'Mobile PIN' ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Built-in TOTP Generator (if configured) */}
          {account.totp?.hasTotp && totpData && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-emerald-400" />
                  {account.totp.issuer || '2FA Authenticator'} Token
                </p>
                <p className="text-xl font-mono font-bold text-emerald-400 tracking-widest mt-0.5 tabular-nums">
                  {totpData.code}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded-md">
                  {totpData.secondsRemaining}s
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(totpData.code, '2FA Code')}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300"
                >
                  {copiedLabel === '2FA Code' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================= 4. FINANCIAL TRACKER & TRANSACTIONS ================= */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-mono text-slate-400">Account Balance</p>
              <h3 className="text-xl font-extrabold font-mono text-slate-100 tabular-nums">
                {formatCurrency(account.currentBalance, account.currency)}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowAddTx(!showAddTx)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record</span>
            </button>
          </div>

          {/* Income / Expense mini strip */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center gap-2">
              <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400">
                <ArrowDownLeft className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[9px] uppercase font-mono text-slate-400">Income Logged</p>
                <p className="font-mono font-semibold text-emerald-400 tabular-nums">
                  +{formatCurrency(totalIncome, account.currency)}
                </p>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center gap-2">
              <div className="p-1 rounded-lg bg-rose-500/10 text-rose-400">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[9px] uppercase font-mono text-slate-400">Expenses Logged</p>
                <p className="font-mono font-semibold text-rose-400 tabular-nums">
                  -{formatCurrency(totalExpense, account.currency)}
                </p>
              </div>
            </div>
          </div>

          {/* Inline Add Transaction Form */}
          {showAddTx && (
            <form onSubmit={handleSaveTransaction} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-fade-in">
              <p className="text-xs font-semibold text-slate-200">New Transaction Entry</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono">Type</label>
                  <div className="flex rounded-lg overflow-hidden border border-slate-700 h-9">
                    <button
                      type="button"
                      onClick={() => setTxType('expense')}
                      className={`flex-1 text-xs font-medium ${txType === 'expense' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                    >
                      Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => setTxType('income')}
                      className={`flex-1 text-xs font-medium ${txType === 'income' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                    >
                      Income
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono">Category</label>
                  <input
                    type="text"
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    placeholder="Utilities, Client, Lease..."
                    className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono">Note (Optional)</label>
                  <input
                    type="text"
                    value={txNote}
                    onChange={(e) => setTxNote(e.target.value)}
                    placeholder="Memo..."
                    className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddTx(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  Save Entry
                </button>
              </div>
            </form>
          )}

          {/* Transactions List */}
          <div>
            <h5 className="text-[11px] uppercase font-mono tracking-wider text-slate-400 mb-2">
              Recent Transactions
            </h5>
            {account.transactions && account.transactions.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {account.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1.5 rounded-lg ${
                          tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {tx.type === 'income' ? (
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200">{tx.category}</p>
                        <p className="text-[10px] text-slate-400">{tx.date} {tx.note ? `• ${tx.note}` : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono font-semibold tabular-nums ${
                          tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amount, account.currency)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteTransaction(account.id, tx.id)}
                        aria-label="Delete transaction"
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-2">
                No transactions recorded for this account yet.
              </p>
            )}
          </div>
        </div>

        {/* ================= 5. METADATA & MEMO ================= */}
        {account.memo && (
          <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <p className="text-[10px] uppercase font-mono text-slate-400 mb-1">{t.memo}</p>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
              {account.memo}
            </p>
          </div>
        )}

        {/* ================= 6. EDIT / DELETE ACTIONS ================= */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to permanently delete this account record from the vault?')) {
                onDelete(account.id);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t.deleteAccount}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onEdit(account);
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Account</span>
          </button>
        </div>
      </div>

      {/* Safe Share Snippet Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-[#0e1626] border border-slate-800 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-emerald-400" />
                Zero-Knowledge Share Snippet
              </h4>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Safe snippet to share account number and bank info without exposing sensitive PINs or CVVs.
            </p>
            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 whitespace-pre-wrap select-all">
              {safeShareText}
            </pre>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(safeShareText);
                setShareCopied(true);
                setTimeout(() => setShareCopied(false), 2000);
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              {shareCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{shareCopied ? 'Copied to Clipboard!' : 'Copy Safe Snippet'}</span>
            </button>
          </div>
        </div>
      )}
    </BottomSheet>
  );
};
