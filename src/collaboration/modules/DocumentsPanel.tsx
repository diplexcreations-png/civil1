import React, { useState, useRef } from 'react';
import { Upload, FileText, Trash2, Download, Search, Filter } from 'lucide-react';
import { useCollab } from '../CollaborationContext';
import { Card, cls, formatNum } from './shared';
import { DOCUMENT_CATEGORIES, type DocType } from '../types';

export default function DocumentsPanel() {
  const { state, currentDocuments, addDocument, removeDocument, uploadProjectFile } = useCollab();
  const pid = state.currentProjectId || 'default';
  const fileRef = useRef<HTMLInputElement>(null);

  const [filterType, setFilterType] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);

  const filtered = currentDocuments.filter(d => {
    if (filterType && d.type !== filterType) return false;
    if (filterCat && d.category !== filterCat) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await uploadProjectFile(pid, file, { category: 'Other', type: 'other' as DocType });
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const docTypes = [...new Set(currentDocuments.map(d => d.type))];
  const typeLabels: Record<string, string> = {
    drawing: 'Drawing', specification: 'Spec', report: 'Report', photo: 'Photo',
    contract: 'Contract', correspondence: 'Correspondence', other: 'Other',
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#94A3B8]" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search documents..." className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg pl-7 pr-3 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none">
          <option value="">All Types</option>
          {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none">
          <option value="">All Categories</option>
          {DOCUMENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input ref={fileRef} type="file" onChange={handleFileUpload} className="hidden" />
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#2563EB] text-white rounded-xl text-[10px] font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer disabled:opacity-50">
          <Upload className="w-3 h-3" /> {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      <div className="space-y-2">
        {filtered.map(doc => (
          <div key={doc.id} className="bg-white dark:bg-[#0D1527] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-[#2563EB]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#0F172A] dark:text-white truncate">{doc.name}</span>
                    <span className="px-1 py-0.5 rounded text-[8px] font-semibold bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] uppercase">{doc.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-[#94A3B8] mt-0.5">
                    <span>{doc.category}</span>
                    <span>·</span>
                    <span>{formatNum(doc.fileSize, 0)} bytes</span>
                    <span>·</span>
                    <span>v{doc.version}</span>
                    <span>·</span>
                    <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                {doc.fileUrl && (
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                    className="p-1.5 text-[#2563EB] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] rounded-lg cursor-pointer">
                    <Download className="w-3.5 h-3.5" />
                  </a>
                )}
                <button onClick={() => removeDocument(pid, doc.id)}
                  className="p-1.5 text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-[#94A3B8] text-center py-8 text-xs">No documents uploaded. Upload your first document above.</p>
        )}
      </div>
    </div>
  );
}
