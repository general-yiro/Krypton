import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as installed PWA, hide
  if (isInstalled) return null;

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="flex items-center gap-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="whitespace-nowrap">Install PWA</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span className="whitespace-nowrap">Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-[#0c1220] border border-slate-800 p-6 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-slate-100">Install Krypton Vault</h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                To install Krypton Vault on your iPhone or iPad:
                <br /><br />
                1. Tap the <strong className="text-slate-200">Share</strong> icon at the bottom of Safari.<br />
                2. Scroll down and tap <strong className="text-emerald-400">Add to Home Screen</strong>.<br />
                3. Launch directly from your home screen with zero-knowledge offline security!
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-semibold text-white transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
