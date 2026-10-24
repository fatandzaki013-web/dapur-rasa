import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BookOpen, Calendar, User, ArrowRight, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PublicArticlesPage() {
  let articles: any[] = [];
  try {
    articles = await (prisma as any).article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    });
  } catch (error) {
    console.warn("PublicArticlesPage fetch warning:", error);
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col font-sans text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cerita, Edukasi &amp; Resep</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#4B291B] tracking-tight font-serif mb-3">
            Artikel &amp; Inspirasi Dapur Rasa
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Temukan panduan memilih kudapan terbaik, rahasia kelezatan kue tradisional, dan tips seputar sajian istimewa untuk berbagai acara Anda.
          </p>
        </div>

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-amber-100 p-8 shadow-xs">
            <BookOpen className="w-12 h-12 text-amber-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">Belum Ada Artikel</h3>
            <p className="text-xs text-slate-500 mt-1">Nantikan artikel dan tips menarik berikutnya dari kami!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art: any) => (
              <article
                key={art.id}
                className="bg-white rounded-2xl overflow-hidden border border-amber-100/80 shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                {/* Cover Image */}
                <Link href={`/artikel/${art.slug}`} className="block relative aspect-16/10 overflow-hidden bg-amber-50">
                  {art.coverImage ? (
                    <img
                      src={art.coverImage}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-amber-300">
                      <BookOpen className="w-10 h-10" />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[#4B291B] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                    {art.category || "Umum"}
                  </span>
                </Link>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {art.publishedAt
                          ? new Date(art.publishedAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {art.authorName || "Dapur Rasa"}
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug mb-2 font-serif">
                      <Link href={`/artikel/${art.slug}`}>{art.title}</Link>
                    </h2>

                    {art.excerpt && (
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                        {art.excerpt}
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/artikel/${art.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 pt-3 border-t border-slate-100 transition-colors"
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
