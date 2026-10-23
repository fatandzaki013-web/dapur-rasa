"use client";

import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, CheckCircle, AlertCircle, X, Star, HelpCircle, MessageSquareQuote } from "lucide-react";

interface Testimonial {
  id: string;
  customerName: string;
  comment: string;
  rating: number;
  avatarUrl?: string | null;
  eventOrProduct?: string | null;
  isApproved: boolean;
  displayOrder: number;
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  isActive: boolean;
}

export default function AdminTestimonialsFaqPage() {
  const [activeTab, setActiveTab] = useState<"testimonials" | "faqs">("testimonials");
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Testimonial Modal
  const [isTestiModalOpen, setIsTestiModalOpen] = useState(false);
  const [isEditingTesti, setIsEditingTesti] = useState(false);
  const [testiId, setTestiId] = useState<string | null>(null);
  const [testiName, setTestiName] = useState("");
  const [testiComment, setTestiComment] = useState("");
  const [testiRating, setTestiRating] = useState(5);
  const [testiAvatar, setTestiAvatar] = useState("");
  const [testiEvent, setTestiEvent] = useState("");
  const [testiApproved, setTestiApproved] = useState(true);

  // FAQ Modal
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [isEditingFaq, setIsEditingFaq] = useState(false);
  const [faqId, setFaqId] = useState<string | null>(null);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqCategory, setFaqCategory] = useState("Umum");
  const [faqOrder, setFaqOrder] = useState(0);
  const [faqActive, setFaqActive] = useState(true);

  const fetchAll = async () => {
    try {
      const [tRes, fRes] = await Promise.all([
        fetch("/api/admin/testimonials"),
        fetch("/api/admin/faqs"),
      ]);
      const tData = await tRes.json();
      const fData = await fRes.json();
      if (tData.testimonials) setTestimonials(tData.testimonials);
      if (fData.faqs) setFaqs(fData.faqs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    fetchAll().finally(() => clearTimeout(timer));
    return () => clearTimeout(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Testimonial Handlers
  const openCreateTesti = () => {
    setIsEditingTesti(false);
    setTestiId(null);
    setTestiName("");
    setTestiComment("");
    setTestiRating(5);
    setTestiAvatar("");
    setTestiEvent("Pesanan Snack Box");
    setTestiApproved(true);
    setIsTestiModalOpen(true);
  };

  const openEditTesti = (t: Testimonial) => {
    setIsEditingTesti(true);
    setTestiId(t.id);
    setTestiName(t.customerName);
    setTestiComment(t.comment);
    setTestiRating(t.rating);
    setTestiAvatar(t.avatarUrl || "");
    setTestiEvent(t.eventOrProduct || "");
    setTestiApproved(t.isApproved);
    setIsTestiModalOpen(true);
  };

  const handleSaveTesti = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditingTesti ? `/api/admin/testimonials/${testiId}` : "/api/admin/testimonials";
      const method = isEditingTesti ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: testiName.trim(),
          comment: testiComment.trim(),
          rating: Number(testiRating),
          avatarUrl: testiAvatar.trim() || null,
          eventOrProduct: testiEvent.trim() || null,
          isApproved: testiApproved,
        }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan testimoni.");
      showToast(isEditingTesti ? "Testimoni diperbarui." : "Testimoni ditambahkan.");
      setIsTestiModalOpen(false);
      fetchAll();
    } catch (err: any) {
      alert(err.message || "Gagal.");
    }
  };

  const handleDeleteTesti = async (id: string) => {
    if (!confirm("Hapus ulasan ini?")) return;
    try {
      await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      showToast("Testimoni dihapus.");
      fetchAll();
    } catch (e) {
      alert("Gagal menghapus.");
    }
  };

  // FAQ Handlers
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

      if (!res.ok) throw new Error("Gagal menyimpan FAQ.");
      showToast(isEditingFaq ? "FAQ diperbarui." : "FAQ ditambahkan.");
      setIsFaqModalOpen(false);
      fetchAll();
    } catch (err: any) {
      alert(err.message || "Gagal.");
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm("Hapus pertanyaan FAQ ini?")) return;
    try {
      await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
      showToast("FAQ dihapus.");
      fetchAll();
    } catch (e) {
      alert("Gagal menghapus.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-amber-600/30 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 font-heading">
            Manajemen Testimoni & FAQ
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Kelola ulasan pembeli, persetujuan tampil, dan pertanyaan umum seputar toko kue Anda.
          </p>
        </div>

        {activeTab === "testimonials" ? (
          <button
            onClick={openCreateTesti}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Testimoni</span>
          </button>
        ) : (
          <button
            onClick={openCreateFaq}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah FAQ Baru</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab("testimonials")}
          className={`pb-3 px-2 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "testimonials"
              ? "border-amber-700 text-amber-800"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <MessageSquareQuote className="w-4 h-4" />
          <span>Testimoni Pelanggan ({testimonials.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("faqs")}
          className={`pb-3 px-2 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "faqs"
              ? "border-amber-700 text-amber-800"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Pertanyaan FAQ ({faqs.length})</span>
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-stone-500">Memuat data...</div>
      ) : activeTab === "testimonials" ? (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 font-bold text-stone-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Nama Pelanggan</th>
                <th className="py-3 px-4">Komentar</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Status Tampil</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {testimonials.map((t) => (
                <tr key={t.id} className="hover:bg-stone-50/70">
                  <td className="py-3 px-4 font-bold text-stone-900">
                    {t.customerName}
                    {t.eventOrProduct && (
                      <span className="text-[10px] text-stone-400 block font-normal">
                        {t.eventOrProduct}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-stone-700 max-w-xs truncate">
                    &ldquo;{t.comment}&rdquo;
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.isApproved ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      {t.isApproved ? "Disetujui" : "Disembunyikan"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditTesti(t)}
                        className="p-1.5 text-stone-600 hover:text-amber-800 hover:bg-stone-100 rounded-lg"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTesti(t.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 font-bold text-stone-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Pertanyaan</th>
                <th className="py-3 px-4">Jawaban Singkat</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {faqs.map((f) => (
                <tr key={f.id} className="hover:bg-stone-50/70">
                  <td className="py-3 px-4 font-semibold text-stone-500">{f.category}</td>
                  <td className="py-3 px-4 font-bold text-stone-900 max-w-xs">{f.question}</td>
                  <td className="py-3 px-4 text-stone-600 max-w-xs truncate">{f.answer}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        f.isActive ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      {f.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditFaq(f)}
                        className="p-1.5 text-stone-600 hover:text-amber-800 hover:bg-stone-100 rounded-lg"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFaq(f.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Testi */}
      {isTestiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b">
              <h2 className="font-heading font-bold text-base text-stone-900">
                {isEditingTesti ? "Edit Testimoni" : "Tambah Testimoni"}
              </h2>
              <button onClick={() => setIsTestiModalOpen(false)}>
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleSaveTesti} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Nama Pelanggan</label>
                <input
                  type="text"
                  required
                  value={testiName}
                  onChange={(e) => setTestiName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Ulasan / Komentar</label>
                <textarea
                  required
                  rows={3}
                  value={testiComment}
                  onChange={(e) => setTestiComment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Rating (Bintang 1-5)</label>
                  <select
                    value={testiRating}
                    onChange={(e) => setTestiRating(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border bg-white"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Bintang)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Bintang)</option>
                    <option value={3}>⭐⭐⭐ (3 Bintang)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Konteks Acara / Produk</label>
                  <input
                    type="text"
                    value={testiEvent}
                    onChange={(e) => setTestiEvent(e.target.value)}
                    placeholder="Snack Box Pengajian"
                    className="w-full px-3 py-2 rounded-xl border"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={testiApproved}
                    onChange={(e) => setTestiApproved(e.target.checked)}
                    className="rounded text-amber-700"
                  />
                  <span className="font-semibold">Setujui & Tampilkan di Website</span>
                </label>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTestiModalOpen(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-700 text-white font-bold rounded-xl"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal FAQ */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b">
              <h2 className="font-heading font-bold text-base text-stone-900">
                {isEditingFaq ? "Edit FAQ" : "Tambah FAQ"}
              </h2>
              <button onClick={() => setIsFaqModalOpen(false)}>
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Pertanyaan</label>
                <input
                  type="text"
                  required
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Jawaban</label>
                <textarea
                  required
                  rows={4}
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Kategori FAQ</label>
                  <input
                    type="text"
                    value={faqCategory}
                    onChange={(e) => setFaqCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Urutan</label>
                  <input
                    type="number"
                    value={faqOrder}
                    onChange={(e) => setFaqOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={faqActive}
                    onChange={(e) => setFaqActive(e.target.checked)}
                    className="rounded text-amber-700"
                  />
                  <span className="font-semibold">Aktifkan Pertanyaan Ini</span>
                </label>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFaqModalOpen(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-700 text-white font-bold rounded-xl"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
