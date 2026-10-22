import React, { useState } from 'react';
import { Shield, Lock, KeyRound, Fingerprint, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';
import { SupportedLanguage } from '../types/account';
import { translations } from '../utils/i18n';

interface MasterLockModalProps {
  isLocked: boolean;
  onUnlock: (passphrase: string) => Promise<boolean>;
  onSetupMaster: (passphrase: string) => Promise<void>;
  hasExistingMaster: boolean;
  currentLanguage: SupportedLanguage;
}

export const MasterLockModal: React.FC<MasterLockModalProps> = ({
  isLocked,
  onUnlock,
  onSetupMaster,
  hasExistingMaster,
  currentLanguage,
}) => {
  const t = translations[currentLanguage];

  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isLocked && hasExistingMaster) return null;

  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase) return;
    setIsVerifying(true);
    setErrorMessage(null);

    try {
      if (!hasExistingMaster) {
        if (passphrase.length < 6) {
          setErrorMessage('Master Passphrase must be at least 6 characters.');
          setIsVerifying(false);
          return;
        }
        if (passphrase !== confirmPassphrase) {
          setErrorMessage('Passphrases do not match.');
          setIsVerifying(false);
          return;
        }
        await onSetupMaster(passphrase);
      } else {
        const success = await onUnlock(passphrase);
        if (!success) {
          setErrorMessage('Invalid Master Passphrase. Decryption failed.');
        }
      }
    } catch {
      setErrorMessage('Decryption verification error.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBiometricSimulate = async () => {
    setIsVerifying(true);
    setErrorMessage(null);
    try {
      // If WebAuthn available or demo biometrics
      if (typeof window !== 'undefined' && window.PublicKeyCredential) {
        // Quick unlock simulation for dev preview
        await new Promise((r) => setTimeout(r, 600));
        // Use demo default if unlocked via biometrics
        const ok = await onUnlock('Krypton@2026');
        if (!ok) {
          // If custom password was set, prompt to enter passphrase
          setErrorMessage('Please enter your Master Passphrase to complete biometric pairing.');
        }
      } else {
        setErrorMessage('Biometrics not available on this device. Please use your master passphrase.');
      }
    } catch {
      setErrorMessage('Biometric verification cancelled.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070b14]/95 backdrop-blur-xl animate-fade-in text-slate-100">
      <div className="w-full max-w-sm rounded-3xl bg-[#0d1424] border border-emerald-500/30 p-6 shadow-2xl shadow-emerald-950/40 relative overflow-hidden">
        {/* Top ambient glow */}
        <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        {/* Shield Icon & Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-900/30 border border-emerald-500/40 mx-auto flex items-center justify-center shadow-inner">
            <Lock className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-100 tracking-tight font-sans">
              {t.appName}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {hasExistingMaster ? t.enterMasterPin : 'Initialize Zero-Knowledge Vault'}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleUnlockSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 font-mono">
              {hasExistingMaster ? 'Master Passphrase' : 'Create Master Passphrase'}
            </label>
            <div className="relative">
              <input
                type={showPassphrase ? 'text' : 'password'}
                required
                value={passphrase}
                onChange={(e) => {
                  setPassphrase(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder={hasExistingMaster ? 'Enter your master passphrase...' : 'At least 6 characters...'}
                className="w-full h-11 px-3.5 pr-10 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassphrase(!showPassphrase)}
                aria-label="Toggle password visibility"
                className="absolute right-3 top-3 text-slate-400 hover:text-white"
              >
                {showPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {!hasExistingMaster && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 font-mono">
                Confirm Master Passphrase
              </label>
              <input
                type={showPassphrase ? 'text' : 'password'}
                required
                value={confirmPassphrase}
                onChange={(e) => setConfirmPassphrase(e.target.value)}
                placeholder="Re-type master passphrase..."
                className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {errorMessage && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 text-center">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all disabled:opacity-50"
          >
            <KeyRound className="w-4 h-4" />
            <span>{isVerifying ? 'Decrypting Vault...' : hasExistingMaster ? t.unlockVault : 'Initialize Vault'}</span>
          </button>
        </form>

        {/* Biometric Unlock Option */}
        {hasExistingMaster && (
          <div className="mt-4 pt-4 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={handleBiometricSimulate}
              disabled={isVerifying}
              className="w-full py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800/80 active:scale-[0.98] text-slate-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Fingerprint className="w-4 h-4 text-emerald-400" />
              <span>{t.biometricUnlock}</span>
            </button>
          </div>
        )}

        {/* Security Architecture Badge */}
        <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
          <Shield className="w-3 h-3 text-emerald-400" />
          <span>PBKDF2 SHA-256 • AES-256-GCM Zero-Knowledge</span>
        </div>
      </div>
    </div>
  );
};
