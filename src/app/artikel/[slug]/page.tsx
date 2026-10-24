import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Calendar,
  User,
  ArrowLeft,
  Tag,
  ShoppingBag,
  Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let article: any = null;
  let relatedArticles: any[] = [];

  try {
    article = await (prisma as any).article.findUnique({
      where: { slug },
    });

    if (article) {
      relatedArticles = await (prisma as any).article.findMany({
        where: {
          status: "PUBLISHED",
          id: { not: article.id },
        },
        take: 3,
        orderBy: { publishedAt: "desc" },
      });
    }
  } catch (error) {
    console.warn("ArticleDetailPage fetch error:", error);
  }

  if (!article || article.status !== "PUBLISHED") {
    notFound();
  }

  // Calculate estimated reading time
  const wordCount = (article.content || "").split(/\s+/).length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col font-sans text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/artikel"
            className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Semua Artikel</span>
          </Link>
        </div>

        {/* Article Header */}
        <header className="mb-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              {article.category || "Kuliner & Resep"}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{readMinutes} menit baca</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#4B291B] tracking-tight font-serif leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-amber-100">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-amber-600" />
              <span className="font-semibold text-slate-800">{article.authorName || "Dapur Rasa"}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>
                {article.publishedAt
                  ? new Date(article.publishedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "-"}
              </span>
            </div>
          </div>
        </header>

        {/* Featured Cover Image */}
        {article.coverImage && (
          <div className="mb-8 rounded-3xl overflow-hidden shadow-sm aspect-16/9 bg-amber-50">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Body */}
        <article className="bg-white rounded-3xl p-6 sm:p-10 border border-amber-100/80 shadow-xs mb-10">
          {article.excerpt && (
            <div className="p-4.5 rounded-2xl bg-amber-50/70 border-l-4 border-amber-500 text-xs sm:text-sm text-slate-700 font-medium leading-relaxed mb-6 italic">
              {article.excerpt}
            </div>
          )}

          {/* Render content lines */}
          <div className="prose prose-amber max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
            {article.content.split("\n\n").map((paragraph: string, idx: number) => {
              if (paragraph.startsWith("## ")) {
                return (
                  <h2 key={idx} className="text-xl sm:text-2xl font-extrabold text-[#4B291B] font-serif pt-4 mb-2">
                    {paragraph.replace("## ", "")}
                  </h2>
                );
              }
              if (paragraph.startsWith("### ")) {
                return (
                  <h3 key={idx} className="text-base sm:text-lg font-bold text-slate-900 font-serif pt-2 mb-1">
                    {paragraph.replace("### ", "")}
                  </h3>
                );
              }
              if (paragraph.startsWith("> ")) {
                return (
                  <blockquote key={idx} className="border-l-4 border-amber-400 pl-4 py-2 italic bg-amber-50/40 rounded-r-xl text-slate-700">
                    {paragraph.replace("> ", "")}
                  </blockquote>
                );
              }
              return (
                <p key={idx} className="whitespace-pre-line">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Tags */}
          {article.tags && (
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <Tag className="w-4 h-4 text-slate-400" />
              {article.tags.split(",").map((t: string) => (
                <span
                  key={t.trim()}
                  className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[11px] font-medium"
                >
                  #{t.trim()}
                </span>
              ))}
            </div>
          )}
        </article>

        {/* CTA Box */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-6 mb-12">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-bold font-serif">Tertarik Mencicipi Sajian Kami?</h3>
            <p className="text-xs text-amber-100 max-w-md">
              Pesan kue basah, bolu panggang, atau paket snack box lezat khas Dapur Rasa sekarang.
            </p>
          </div>
          <Link
            href="/produk"
            className="px-6 py-3 bg-white text-amber-800 rounded-xl text-xs font-bold hover:bg-amber-50 transition-all shadow-xs shrink-0 flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Lihat Katalog Produk</span>
          </Link>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 font-serif">Artikel Terkait Lainnya</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedArticles.map((rel: any) => (
                <Link
                  key={rel.id}
                  href={`/artikel/${rel.slug}`}
                  className="bg-white rounded-2xl p-4 border border-amber-100/70 hover:shadow-md transition-all group block"
                >
                  <div className="aspect-16/10 rounded-xl overflow-hidden bg-slate-100 mb-3">
                    {rel.coverImage && (
                      <img
                        src={rel.coverImage}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-700 line-clamp-2 mb-1">
                    {rel.title}
                  </h4>
                  <div className="text-[10px] text-slate-400">
                    {rel.publishedAt
                      ? new Date(rel.publishedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })
                      : "-"}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
