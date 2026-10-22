import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Download,
  Upload,
  Lock,
  Clock,
  Key,
  CheckCircle,
  FileKey,
  RefreshCw,
} from 'lucide-react';
import { AccountRecord, SupportedLanguage, VaultSecurityConfig } from '../types/account';
import { auditPinStrength } from '../utils/validator';
import { translations } from '../utils/i18n';

interface SecurityAuditViewProps {
  accounts: AccountRecord[];
  securityConfig: VaultSecurityConfig;
  onUpdateSecurityConfig: (config: VaultSecurityConfig) => void;
  onExportBackup: () => void;
  onImportBackup: (jsonContent: string) => void;
  currentLanguage: SupportedLanguage;
}

export const SecurityAuditView: React.FC<SecurityAuditViewProps> = ({
  accounts,
  securityConfig,
  onUpdateSecurityConfig,
  onExportBackup,
  onImportBackup,
  currentLanguage,
}) => {
  const t = translations[currentLanguage];
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // 1. Audit PINs
  const pinAudits = accounts.map((acc) => {
    const atmAudit = acc.atm?.hasAtm ? auditPinStrength(acc.atm.atmPin) : null;
    const mobileAudit = acc.mobileBanking?.hasMobileBanking
      ? auditPinStrength(acc.mobileBanking.mobileBankingPin)
      : null;
    return {
      acc,
      atmAudit,
      mobileAudit,
    };
  });

  const weakPinCount = pinAudits.filter(
    (a) => (a.atmAudit && a.atmAudit.score <= 2) || (a.mobileAudit && a.mobileAudit.score <= 2)
  ).length;

  // 2. Audit Reused PINs
  const pinOccurrences: Record<string, string[]> = {};
  accounts.forEach((acc) => {
    if (acc.atm?.hasAtm && acc.atm.atmPin) {
      pinOccurrences[acc.atm.atmPin] = pinOccurrences[acc.atm.atmPin] || [];
      pinOccurrences[acc.atm.atmPin].push(`${acc.name} (ATM)`);
    }
    if (acc.mobileBanking?.hasMobileBanking && acc.mobileBanking.mobileBankingPin) {
      pinOccurrences[acc.mobileBanking.mobileBankingPin] =
        pinOccurrences[acc.mobileBanking.mobileBankingPin] || [];
      pinOccurrences[acc.mobileBanking.mobileBankingPin].push(`${acc.name} (Mobile)`);
    }
  });

  const sharedPins = Object.entries(pinOccurrences).filter(([, accountsList]) => accountsList.length > 1);

  // Overall Health Score (0 - 100)
  let healthScore = 100;
  if (weakPinCount > 0) healthScore -= weakPinCount * 15;
  if (sharedPins.length > 0) healthScore -= sharedPins.length * 20;
  healthScore = Math.max(20, Math.min(100, healthScore));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        onImportBackup(text);
        setImportStatus('Backup loaded! Enter master password to decrypt.');
      } catch {
        setImportStatus('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner / Audit Score */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0e172a] via-[#091120] to-[#040810] border border-slate-800 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400">
              Zero-Knowledge Vault Guard
            </span>
            <h3 className="text-xl font-bold text-slate-100">{t.securityAudit}</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Continuous client-side cryptographic analysis of PIN entropy, credential reuse, and local encryption at rest.
            </p>
          </div>
          {/* Health Score Circle */}
          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="currentColor"
                strokeWidth="6"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray={200}
                strokeDashoffset={200 - (200 * healthScore) / 100}
                strokeLinecap="round"
                className={healthScore >= 80 ? 'text-emerald-400' : healthScore >= 60 ? 'text-amber-400' : 'text-rose-500'}
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-extrabold font-mono text-slate-100">{healthScore}</span>
              <span className="text-[9px] uppercase font-mono text-slate-400">/ 100</span>
            </div>
          </div>
        </div>

        {/* Audit metrics row */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800/80 text-center">
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <p className="text-[9px] uppercase font-mono text-slate-400">Total Accounts</p>
            <p className="text-base font-bold font-mono text-slate-100">{accounts.length}</p>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <p className="text-[9px] uppercase font-mono text-slate-400">Weak PINs</p>
            <p className={`text-base font-bold font-mono ${weakPinCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {weakPinCount}
            </p>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <p className="text-[9px] uppercase font-mono text-slate-400">Reused PINs</p>
            <p className={`text-base font-bold font-mono ${sharedPins.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {sharedPins.length}
            </p>
          </div>
        </div>
      </div>

      {/* Security Alerts List */}
      {(weakPinCount > 0 || sharedPins.length > 0) && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Security Recommendations Detected</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
            {weakPinCount > 0 && (
              <li>
                {weakPinCount} account(s) use simple sequential or repetitive PINs (e.g. 1234, 0000). We recommend updating to 6-digit random PINs.
              </li>
            )}
            {sharedPins.map(([pin, list], idx) => (
              <li key={idx}>
                Credential reuse: The same PIN is used across multiple accounts: {list.join(', ')}.
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Auto-Lock Settings */}
      <div className="p-5 rounded-2xl bg-[#0c1220] border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
            Auto-Lock & Inactivity Protocol
          </h4>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-2">
            Automatically lock the vault and flush decrypted keys from memory after inactivity:
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 5, 15, 0].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() =>
                  onUpdateSecurityConfig({ ...securityConfig, autoLockMinutes: mins })
                }
                className={`py-2 px-3 rounded-xl text-xs font-semibold font-mono transition-all ${
                  securityConfig.autoLockMinutes === mins
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {mins === 0 ? 'Immediate' : `${mins} min`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
          <div>
            <p className="text-xs font-semibold text-slate-200">Lock On Tab Switch</p>
            <p className="text-[10px] text-slate-400">Immediately lock if the browser window or PWA loses focus</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={securityConfig.lockOnTabSwitch}
              onChange={(e) =>
                onUpdateSecurityConfig({
                  ...securityConfig,
                  lockOnTabSwitch: e.target.checked,
                })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>
      </div>

      {/* Backup & Disaster Recovery */}
      <div className="p-5 rounded-2xl bg-[#0c1220] border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <FileKey className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
            Encrypted Backup & Recovery
          </h4>
        </div>
        <p className="text-xs text-slate-400">
          Export your entire vault as an AES-256-GCM encrypted backup file. Only your Master Passphrase can decrypt it.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Export */}
          <button
            type="button"
            onClick={onExportBackup}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>{t.emergencyExport}</span>
          </button>

          {/* Import */}
          <label className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-semibold transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>{t.importVault}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {importStatus && (
          <p className="text-xs text-emerald-400 font-medium p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            {importStatus}
          </p>
        )}
      </div>

      {/* Zero-Knowledge Architecture Explainer */}
      <div className="p-5 rounded-2xl bg-[#070b14] border border-slate-800/80 space-y-3">
        <div className="flex items-center gap-2 text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase font-mono tracking-wider">
            Zero-Knowledge Cryptographic Spec
          </span>
        </div>
        <div className="text-[11px] text-slate-400 space-y-1.5 leading-relaxed font-mono">
          <p>• Key Derivation: PBKDF2 (HMAC-SHA-256, 100,000 rounds, 128-bit CSPRNG salt)</p>
          <p>• Cipher: AES-GCM 256-bit with fresh 96-bit IV per transaction</p>
          <p>• Master Password: Never transmitted over the wire or stored in plaintext</p>
          <p>• Safe Search Isolation: PINs and CVVs strictly exempt from memory search indexes</p>
        </div>
      </div>
    </div>
  );
};
