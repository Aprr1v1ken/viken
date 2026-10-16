import React, { useState } from 'react';
import { MapPin, Users, Home, Phone, Layers, ChevronRight, Award } from 'lucide-react';
import type { Rayon, CategorialGroup, Member } from '../../types/index.ts';

interface RayonsViewProps {
  rayons: Rayon[];
  categorials: CategorialGroup[];
  members: Member[];
  onSelectMember: (member: Member) => void;
}

export const RayonsView: React.FC<RayonsViewProps> = ({
  rayons,
  categorials,
  members,
  onSelectMember,
}) => {
  const [activeTab, setActiveTab] = useState<'rayons' | 'categorials'>('rayons');
  const [selectedRayonId, setSelectedRayonId] = useState<string>(rayons[0]?.id || 'r1');
  const [selectedCatId, setSelectedCatId] = useState<string>(categorials[0]?.id || 'c1');

  const selectedRayon = rayons.find((r) => r.id === selectedRayonId) || rayons[0];
  const rayonMembers = members.filter((m) => m.rayonId === selectedRayon?.id);

  const selectedCat = categorials.find((c) => c.id === selectedCatId) || categorials[0];
  const catMembers = members.filter((m) => m.categorialGroupId === selectedCat?.id);

  return (
    <div className="space-y-6">
      {/* Header and Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 shadow-md">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-400" />
            <span>Rayon Pelayanan & Kategorial GMIT</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Wilayah pelayanan struktural GMIT Betel Fuimelang
          </p>
        </div>

        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('rayons')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'rayons'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            5 Rayon Wilayah
          </button>
          <button
            onClick={() => setActiveTab('categorials')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'categorials'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Kelompok Kategorial
          </button>
        </div>
      </div>

      {activeTab === 'rayons' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rayon List Selector */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 px-1">
              Daftar Rayon Pelayanan
            </h3>
            <div className="space-y-2">
              {rayons.map((r) => {
                const count = members.filter((m) => m.rayonId === r.id).length;
                const isSelected = r.id === selectedRayon?.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRayonId(r.id)}
                    className={`w-full p-4 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400 text-white shadow-md'
                        : 'bg-[#0c1329] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-amber-400">
                        {r.code}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {count} Jiwa
                      </span>
                    </div>
                    <div className="font-bold text-sm text-white">{r.name}</div>
                    <div className="text-xs text-slate-400 mt-1 truncate">
                      Koordinator: {r.leaderName}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rayon Detail & Member List */}
          <div className="lg:col-span-2 space-y-4">
            {selectedRayon && (
              <>
                <div className="p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="font-mono text-xs text-amber-400 font-bold">{selectedRayon.code}</span>
                      <h3 className="text-lg font-bold text-white">{selectedRayon.name}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-mono font-bold text-amber-300">{rayonMembers.length}</span>
                      <span className="text-xs text-slate-400 block">Jiwa Jemaat</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Penatua Koordinator:</span>
                      <span className="font-semibold text-white">{selectedRayon.leaderName}</span>
                      <div className="text-[11px] text-slate-400 font-mono">{selectedRayon.leaderPhone}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Wilayah Cakupan Pelayanan:</span>
                      <span className="text-white">{selectedRayon.coverageArea}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#0c1329] border border-slate-800 overflow-hidden">
                  <div className="p-4 bg-[#070b18] border-b border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Daftar Warga Jemaat di {selectedRayon.name}</span>
                    <span className="text-slate-400">{rayonMembers.length} Anggota</span>
                  </div>
                  <div className="divide-y divide-slate-800 max-h-96 overflow-y-auto">
                    {rayonMembers.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        Belum ada anggota terdaftar di rayon ini.
                      </div>
                    ) : (
                      rayonMembers.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => onSelectMember(m)}
                          className="p-3 px-4 flex items-center justify-between text-xs hover:bg-slate-800/50 cursor-pointer transition-colors"
                        >
                          <div>
                            <div className="font-semibold text-white">{m.fullName}</div>
                            <div className="text-[11px] text-slate-400">
                              {m.memberNo} · {m.familyRole} · {m.gender}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-amber-400 text-[11px] block">{m.categorialGroupName}</span>
                            <span className="text-[10px] text-slate-400">{m.status}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Kategorial View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categorials.map((cat) => {
            const catMembersList = members.filter((m) => m.categorialGroupId === cat.id);
            return (
              <div
                key={cat.id}
                className="p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 hover:border-amber-400/40 transition-all space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      {cat.code}
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      {catMembersList.length} Jiwa
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{cat.name}</h3>
                  <div className="text-xs text-cyan-300 mt-1 font-medium">
                    Target: {cat.targetAgeDesc}
                  </div>
                  <div className="text-xs text-slate-400 mt-2">
                    Koordinator: <span className="text-slate-200">{cat.coordinator}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-2 font-medium">Contoh Anggota:</span>
                  <div className="space-y-1">
                    {catMembersList.slice(0, 3).map((cm) => (
                      <div
                        key={cm.id}
                        onClick={() => onSelectMember(cm)}
                        className="text-xs text-slate-300 hover:text-amber-300 cursor-pointer truncate"
                      >
                        · {cm.fullName} ({cm.rayonName || 'R1'})
                      </div>
                    ))}
                    {catMembersList.length > 3 && (
                      <div className="text-[10px] text-amber-400/80 font-medium">
                        +{catMembersList.length - 3} anggota lainnya
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
