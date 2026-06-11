"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Heart, Share2, Globe, Send, Bookmark, Eye, ChevronRight, Tag } from "lucide-react";
import { mockBlogPosts } from "@/lib/api/mock-db";
import { PublicLayout } from "@/components/layout/PublicLayout";

const sampleContent = `
## The Dawn of AI-Powered Architecture

Artificial intelligence is no longer a futuristic concept — it's actively reshaping how architects design, plan, and present buildings. Tools like PlanCraftAI are enabling architects to generate complete floor plan layouts in seconds rather than hours.

## Key Applications in 2025

### Generative Design
AI algorithms can explore thousands of design variations simultaneously, optimizing for factors like natural light, ventilation, structural efficiency, and cost. What used to take weeks of manual iteration now happens in real-time.

### Automated Vastu and Code Compliance
Instead of manually checking every room orientation against Vastu principles or local building codes, AI automatically flags issues and suggests compliant alternatives during the design phase.

### Cost Intelligence
Real-time cost estimation powered by current market data means architects can present clients with accurate budgets before breaking ground. This eliminates costly surprises during construction.

## The Human Element

Despite these advances, AI tools are augmenting — not replacing — human creativity. The best results come from architects who leverage AI for repetitive, rule-based tasks while focusing their expertise on design intent, client relationships, and spatial experience.

\`\`\`
Plot: 40x60 ft, East-facing
Style: Modern
Rooms: 3BHK + Study
Vastu: Enabled
Budget: Premium
→ Generated in 12 seconds
\`\`\`

## Looking Ahead

As AI models improve, we'll see them handle increasingly complex design challenges — from mixed-use developments to sustainable passive houses. The architects who embrace these tools early will have a significant competitive advantage.

The future of architecture is collaborative: human creativity amplified by machine intelligence.
`;

export default function BlogArticlePage() {
  const params = useParams();
  const post = mockBlogPosts.find(p => p.slug === params.slug) || mockBlogPosts[0];
  const [liked, setLiked] = React.useState(false);
  const [bookmarked, setBookmarked] = React.useState(false);
  const [likes, setLikes] = React.useState(post.likes || 834);
  const related = mockBlogPosts.filter(p => p.id !== post.id).slice(0, 3);

  const handleLike = () => {
    setLiked(l => !l);
    setLikes(n => liked ? n - 1 : n + 1);
  };

  const categoryColors: Record<string, string> = {
    Technology: "bg-blue-50 text-primary dark:bg-blue-950/30",
    Design: "bg-violet-50 text-violet-600 dark:bg-violet-950/30",
    Business: "bg-amber-50 text-amber-600 dark:bg-amber-950/30",
    Sustainability: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30",
    Tutorial: "bg-rose-50 text-rose-600 dark:bg-rose-950/30",
  };

  return (
    <PublicLayout>
      <div className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-700 dark:text-slate-300 truncate max-w-xs">{post.title}</span>
        </nav>

        <div className="grid lg:grid-cols-[1fr_320px] gap-12">
          {/* Article */}
          <article>
            {/* Category + date */}
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${categoryColors[post.category] || "bg-slate-100 text-slate-600"}`}>
                {post.category}
              </span>
              <span className="text-sm text-slate-400">{new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">{post.title}</h1>

            {/* Author row */}
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg shrink-0">
                {post.author.charAt(0)}
              </div>
              <div>
                <p className="font-semibold">{post.author}</p>
                <p className="text-sm text-slate-400">{post.authorRole || "Contributing Writer"}</p>
              </div>
              <div className="ml-auto flex items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {post.readTime} min read</span>
                <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {(post.views || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Hero image placeholder */}
            <div className="aspect-video rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-8 overflow-hidden">
              <div className="text-primary/20 font-black text-9xl select-none">{post.category.charAt(0)}</div>
            </div>

            {/* Content */}
            <div className="prose-content">
              {sampleContent.split("\n").map((line, i) => {
                if (line.startsWith("## ")) return <h2 key={i}>{line.slice(3)}</h2>;
                if (line.startsWith("### ")) return <h3 key={i}>{line.slice(4)}</h3>;
                if (line.startsWith("```")) return <pre key={i} className="text-sm">{sampleContent.match(/```[\s\S]*?```/)?.[0]?.replace(/```/g, "") || ""}</pre>;
                if (line.startsWith("- ")) return null;
                if (line.trim() === "") return <br key={i} />;
                return <p key={i}>{line}</p>;
              })}
            </div>

            {/* Tags */}
            {post.tags && (
              <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-slate-200 dark:border-slate-800">
                <Tag className="w-4 h-4 text-slate-400 mt-0.5" />
                {post.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${liked ? "bg-rose-50 text-rose-600 dark:bg-rose-950/30" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600"}`}
              >
                <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} /> {likes.toLocaleString()}
              </button>
              <button
                onClick={() => setBookmarked(b => !b)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${bookmarked ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-50 hover:text-amber-600"}`}
              >
                <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-current" : ""}`} />
                {bookmarked ? "Saved" : "Save"}
              </button>
              <div className="ml-auto flex gap-2">
                <button className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-500 rounded-xl transition-colors">
                  <Send className="w-4 h-4" />
                </button>
                <button className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors">
                  <Globe className="w-4 h-4" />
                </button>
                <button className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* CTA */}
            <div className="bg-gradient-to-br from-primary to-accent p-6 rounded-2xl text-white">
              <h3 className="font-bold text-lg mb-2">Try PlanCraftAI Free</h3>
              <p className="text-white/80 text-sm mb-4">Generate your first floor plan in under 60 seconds.</p>
              <Link href="/generate" className="block w-full py-2.5 bg-white text-primary font-bold rounded-xl text-center hover:bg-white/90 transition-colors text-sm">
                Start Creating →
              </Link>
            </div>

            {/* Related Posts */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <h3 className="font-bold mb-4">Related Articles</h3>
              <div className="space-y-4">
                {related.map(p => (
                  <Link key={p.id} href={`/blog/${p.slug}`} className="flex gap-3 group">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 shrink-0 flex items-center justify-center text-primary font-bold">
                      {p.category.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">{p.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{p.readTime} min read</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <h3 className="font-bold mb-2">Stay Updated</h3>
              <p className="text-sm text-slate-400 mb-3">Get the latest architecture & AI news in your inbox.</p>
              <input type="email" placeholder="your@email.com" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 mb-2 bg-transparent" />
              <button className="w-full py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">Subscribe Free</button>
            </div>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}
