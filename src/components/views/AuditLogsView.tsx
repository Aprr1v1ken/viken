import React, { useState } from 'react';
import { History, Shield, Search, Clock, User } from 'lucide-react';
import type { AuditLog } from '../../types/index.ts';

interface AuditLogsViewProps {
  logs: AuditLog[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs }) => {
  const [search, setSearch] = useState('');

  const filtered = logs.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.userName.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.module.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 shadow-md">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <History className="w-5 h-5 text-amber-400" />
          <span>Audit Trail Aktivitas Sistem</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Rekaman jejak digital autentikasi, perubahan data jemaat, sakramen, dan transaksi keuangan
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari pengguna, tindakan, modul, atau rincian..."
          className="w-full pl-9 pr-3 py-2 text-xs bg-[#090e1e] border border-slate-800 rounded-xl text-white outline-none focus:border-amber-400"
        />
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl bg-[#0c1329] border border-amber-500/20 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#070b18] text-[11px] uppercase tracking-wider text-amber-400 border-b border-amber-500/20">
              <tr>
                <th className="py-3 px-4">Waktu (WITA - NTT)</th>
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4">Modul</th>
                <th className="py-3 px-4">Tindakan</th>
                <th className="py-3 px-4">Rincian Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    Belum ada catatan aktivitas yang sesuai.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                      {log.userName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 border border-slate-800 text-slate-300">
                        {log.module}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-amber-300">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
