import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** true = tampilan pemulihan memenuhi layar (untuk akar aplikasi / web publik) */
  layarPenuh?: boolean;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Penahan error render: tanpa komponen ini, satu error JavaScript saat
 * me-render (mis. RangeError dari Intl) akan meruntuhkan SELURUH aplikasi
 * menjadi layar putih kosong. Dengan boundary ini pengguna melihat pesan
 * pemulihan yang jelas dan dapat mencoba lagi tanpa kehilangan sesi.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[SYSJEGER] Error render tertangkap ErrorBoundary:', error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const card = (
      <div className="max-w-lg w-full mx-auto my-10 p-6 sm:p-8 rounded-3xl bg-[#0b1226] border border-red-500/40 text-center text-slate-200 shadow-2xl">
        <div className="text-4xl mb-3" aria-hidden="true">⚠️</div>
        <h2 className="text-lg font-extrabold text-red-200">Bagian halaman ini gagal ditampilkan</h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mt-2">
          Mohon maaf atas kendalanya. Silakan coba lagi — data &amp; sesi masuk Anda tidak hilang.
          Bila masalah berulang, sampaikan pesan berikut kepada pengelola situs:
        </p>
        <p className="mt-3 px-3 py-2 rounded-lg bg-red-950/50 border border-red-500/30 text-[11px] font-mono text-red-200 break-words">
          {error.name}: {error.message}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button
            onClick={this.reset}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-colors cursor-pointer"
          >
            Coba Lagi
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
          >
            Muat Ulang Halaman
          </button>
        </div>
      </div>
    );

    if (this.props.layarPenuh) {
      return (
        <div className="min-h-screen bg-[#060a16] flex items-center justify-center p-4 font-sans">
          {card}
        </div>
      );
    }
    return card;
  }
}
