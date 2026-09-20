import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, RotateCcw } from 'lucide-react';
import { selfHealingEngine } from './selfHealing';

interface Props {
  children: ReactNode;
  fallbackSnapshot?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  autoRecoverCountdown: number;
}

export class SelfHealingBoundary extends Component<Props, State> {
  private timer: any = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      autoRecoverCountdown: 2
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      autoRecoverCountdown: 2
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SelfHealingBoundary caught error:', error, errorInfo);
    selfHealingEngine.recordIncident(
      'state_rollback',
      'critical',
      `React UI / Render Hatası yakalandı: ${error.message}. Otomatik kurtarma protokolü başlatıldı.`
    );

    // Start auto-recovery countdown
    this.timer = setInterval(() => {
      this.setState((prev) => {
        if (prev.autoRecoverCountdown <= 1) {
          clearInterval(this.timer);
          this.handleRecover();
          return { ...prev, autoRecoverCountdown: 0 };
        }
        return { ...prev, autoRecoverCountdown: prev.autoRecoverCountdown - 1 };
      });
    }, 1000);
  }

  componentWillUnmount() {
    if (this.timer) clearInterval(this.timer);
  }

  handleRecover = () => {
    if (this.props.fallbackSnapshot) {
      this.props.fallbackSnapshot();
    }
    this.setState({ hasError: false, error: null, autoRecoverCountdown: 2 });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-slate-950 p-6 text-center text-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-3 animate-pulse">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <h3 className="text-base font-bold text-slate-100 mb-1">
            Otonom Self-Healing: Çalışma Zamanı Hatası İzolasyonu
          </h3>
          <p className="text-xs text-slate-400 max-w-md mb-4 leading-relaxed">
            Sistem bir render hatasını izole etti. Sayfayı yenilemenize gerek kalmadan sahne {this.state.autoRecoverCountdown} saniye içinde otomatik onarılıyor.
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={this.handleRecover}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Hemen Onar & Devam Et</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
