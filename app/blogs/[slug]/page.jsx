import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  getBlogBySlug,
  getRelatedBlogs,
  formatBlogDate,
  estimateReadTime,
  getBlogKeywordsList,
} from "@/lib/blogs";

export async function generateMetadata({ params }) {
  const blog = await getBlogBySlug(params.slug);
  if (!blog) {
    return { title: "Blog post not found — TournamentWala.com" };
  }

  const description = blog.meta_description || blog.content?.[0]?.slice(0, 160);

  return {
    title: `${blog.title} — TournamentWala.com`,
    description,
    keywords: blog.keywords || undefined,
    openGraph: {
      title: blog.title,
      description,
      images: blog.cover_image_url ? [blog.cover_image_url] : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }) {
  const blog = await getBlogBySlug(params.slug);
  if (!blog) notFound();

  const readTime = estimateReadTime(blog.content);
  const keywords = getBlogKeywordsList(blog.keywords);
  const related = await getRelatedBlogs(blog.id, 3);

  return (
    <>
      <Navbar />
      <main>
        <article className="section container blog-detail">
          <Link href="/blogs" className="tdp-back">
            ← Back to blog
          </Link>

          <span className="eyebrow">TournamentWala Blog</span>
          <h1 className="blog-detail-title">{blog.title}</h1>

          <div className="blog-detail-meta">
            <span>{formatBlogDate(blog.published_at)}</span>
            <span>·</span>
            <span>{readTime} min read</span>
          </div>

          {blog.cover_image_url && (
            <div className="blog-detail-cover">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={blog.cover_image_url} alt={blog.title} />
            </div>
          )}

          <div className="blog-detail-body">
            {blog.content.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {keywords.length > 0 && (
            <div className="blog-detail-tags">
              {keywords.map((k) => (
                <span key={k} className="chip">
                  {k}
                </span>
              ))}
            </div>
          )}
        </article>

        {related.length > 0 && (
          <section className="container blog-related">
            <h2 className="blog-related-title">Keep reading</h2>
            <div className="blog-grid blog-grid--related">
              {related.map((r) => (
                <Link key={r.id} href={`/blogs/${r.slug}`} className="blog-card">
                  <div className="blog-card-media">
                    {r.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.cover_image_url} alt="" loading="lazy" />
                    ) : (
                      <span className="blog-card-media-fallback" aria-hidden="true">
                        🏆
                      </span>
                    )}
                  </div>
                  <div className="blog-card-body">
                    <div className="blog-card-meta">
                      <span>{formatBlogDate(r.published_at)}</span>
                    </div>
                    <h3 className="blog-card-title">{r.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
