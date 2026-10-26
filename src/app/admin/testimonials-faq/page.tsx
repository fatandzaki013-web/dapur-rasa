"use client";

import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, CheckCircle, AlertCircle, X, HelpCircle } from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  isActive: boolean;
}

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // FAQ Modal state
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [isEditingFaq, setIsEditingFaq] = useState(false);
  const [faqId, setFaqId] = useState<string | null>(null);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqCategory, setFaqCategory] = useState("Umum");
  const [faqOrder, setFaqOrder] = useState(0);
  const [faqActive, setFaqActive] = useState(true);

  const fetchFaqs = async () => {
    try {
      const res = await fetch("/api/admin/faqs");
      const data = await res.json();
      if (data.faqs) setFaqs(data.faqs);
    } catch (e) {
      console.error("Error loading FAQs:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    fetchFaqs().finally(() => clearTimeout(timer));
    return () => clearTimeout(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const openCreateFaq = () => {
    setIsEditingFaq(false);
    setFaqId(null);
    setFaqQuestion("");
    setFaqAnswer("");
    setFaqCategory("Pemesanan");
    setFaqOrder(faqs.length + 1);
    setFaqActive(true);
    setIsFaqModalOpen(true);
  };

  const openEditFaq = (f: FaqItem) => {
    setIsEditingFaq(true);
    setFaqId(f.id);
    setFaqQuestion(f.question);
    setFaqAnswer(f.answer);
    setFaqCategory(f.category);
    setFaqOrder(f.displayOrder);
    setFaqActive(f.isActive);
    setIsFaqModalOpen(true);
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditingFaq ? `/api/admin/faqs/${faqId}` : "/api/admin/faqs";
      const method = isEditingFaq ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: faqQuestion.trim(),
          answer: faqAnswer.trim(),
          category: faqCategory.trim(),
          displayOrder: Number(faqOrder),
          isActive: faqActive,
        }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan FAQ");

      showToast(isEditingFaq ? "FAQ berhasil diperbarui!" : "FAQ baru berhasil ditambahkan!");
      setIsFaqModalOpen(false);
      fetchFaqs();
    } catch (e) {
      alert("Terjadi kesalahan saat menyimpan FAQ.");
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pertanyaan FAQ ini?")) return;
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus.");
      showToast("FAQ berhasil dihapus.");
      fetchFaqs();
    } catch (e) {
      alert("Gagal menghapus FAQ.");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans pb-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#4A0E4E] text-white px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 border border-amber-400/40 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <span>Admin</span>
            <span>/</span>
            <span className="text-[#4A0E4E] font-bold">Tanya Jawab</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-[#4A0E4E]" />
            <span>Kelola Tanya Jawab (FAQ)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola daftar pertanyaan dan jawaban seputar pemesanan kue, ketentuan gratis ongkir Griya Cileungsi 5, dan pembayaran.
          </p>
        </div>

        <button
          onClick={openCreateFaq}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#4A0E4E] hover:bg-[#5C1261] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer active:scale-98 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pertanyaan Baru</span>
        </button>
      </div>

      {/* FAQ Table */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-3xl border">
          Memuat data FAQ...
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {faqs.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#4A0E4E] flex items-center justify-center mx-auto">
                <HelpCircle className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-500">Belum ada data pertanyaan FAQ tersimpan.</p>
              <button
                onClick={openCreateFaq}
                className="px-4 py-2 bg-[#4A0E4E] text-white text-xs font-bold rounded-xl"
              >
                + Tambah FAQ Pertama
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Pertanyaan</th>
                    <th className="py-3 px-4">Jawaban</th>
                    <th className="py-3 px-4 text-center">Urutan</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {faqs.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#4A0E4E] whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full bg-purple-50 text-[#4A0E4E] text-[11px] font-bold border border-purple-100">
                          {f.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs">
                        {f.question}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-sm">
                        <p className="line-clamp-2 text-xs leading-relaxed">{f.answer}</p>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-500 text-xs">
                        {f.displayOrder}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                            f.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {f.isActive ? "Aktif Tampil" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditFaq(f)}
                            className="p-1.5 text-slate-600 hover:text-[#4A0E4E] hover:bg-purple-50 rounded-lg transition cursor-pointer"
                            title="Edit Pertanyaan"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFaq(f.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Hapus Pertanyaan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Tambah / Edit FAQ */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-extrabold text-slate-900 text-base">
                {isEditingFaq ? "Ubah Pertanyaan FAQ" : "Tambah Pertanyaan FAQ Baru"}
              </h2>
              <button
                onClick={() => setIsFaqModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 text-xs uppercase tracking-wide mb-1.5">
                  Pertanyaan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  placeholder="Contoh: Apakah ada gratis ongkir ke Griya Cileungsi 5?"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20 focus:border-[#4A0E4E]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-xs uppercase tracking-wide mb-1.5">
                  Jawaban Lengkap <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  placeholder="Tuliskan jawaban penjelasan yang informatif dan ramah..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20 focus:border-[#4A0E4E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 text-xs uppercase tracking-wide mb-1.5">
                    Kategori Pertanyaan
                  </label>
                  <select
                    value={faqCategory}
                    onChange={(e) => setFaqCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20 focus:border-[#4A0E4E]"
                  >
                    <option value="Pemesanan">Pemesanan</option>
                    <option value="Pengantaran & Ongkir">Pengantaran &amp; Ongkir</option>
                    <option value="Pembayaran">Pembayaran</option>
                    <option value="Kualitas & Bahan">Kualitas &amp; Bahan</option>
                    <option value="Snack Box">Snack Box</option>
                    <option value="Frozen Food">Frozen Food</option>
                    <option value="Umum">Umum</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-xs uppercase tracking-wide mb-1.5">
                    Urutan Tampil (Angka)
                  </label>
                  <input
                    type="number"
                    value={faqOrder}
                    onChange={(e) => setFaqOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4A0E4E]/20 focus:border-[#4A0E4E]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="faqActive"
                  checked={faqActive}
                  onChange={(e) => setFaqActive(e.target.checked)}
                  className="rounded text-[#4A0E4E] focus:ring-[#4A0E4E] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="faqActive" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Tampilkan pertanyaan ini di website utama
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFaqModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4A0E4E] hover:bg-[#5C1261] text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
                >
                  {isEditingFaq ? "Perbarui FAQ" : "Simpan FAQ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
