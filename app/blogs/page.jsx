import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getPublishedBlogs, formatBlogDate, estimateReadTime } from "@/lib/blogs";

export const metadata = {
  title: "Blog — TournamentWala.com",
  description:
    "Guides, city spotlights and tips for finding and organising sports tournaments across India — cricket, football, badminton, kabaddi and more.",
};

export default async function BlogsPage() {
  const blogs = await getPublishedBlogs();

  return (
    <>
      <Navbar />
      <main>
        <section className="section container blog-list-hero">
          <span className="eyebrow">TournamentWala Blog</span>
          <h1 className="section-title">
            Tournament culture,
            <br />
            city by city.
          </h1>
          <p className="post-intro">
            Guides for players hunting their next tournament and organisers
            looking to get more teams through the door — from gully cricket
            in Tamil Nadu to corporate leagues in Chennai.
          </p>
        </section>

        <section className="container blog-list-section">
          {!blogs.length ? (
            <div className="admin-placeholder">
              No blog posts published yet. Check back soon!
            </div>
          ) : (
            <div className="blog-grid">
              {blogs.map((blog) => {
                const readTime = estimateReadTime(blog.content);
                return (
                  <Link
                    key={blog.id}
                    href={`/blogs/${blog.slug}`}
                    className="blog-card"
                  >
                    <div className="blog-card-media">
                      {blog.cover_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={blog.cover_image_url} alt="" loading="lazy" />
                      ) : (
                        <span className="blog-card-media-fallback">{blog.title}</span>
                      )}
                    </div>
                    <div className="blog-card-body">
                      <div className="blog-card-meta">
                        <span>{formatBlogDate(blog.published_at)}</span>
                        <span>·</span>
                        <span>{readTime} min read</span>
                      </div>
                      <h2 className="blog-card-title">{blog.title}</h2>
                      {blog.meta_description && (
                        <p className="blog-card-excerpt">{blog.meta_description}</p>
                      )}
                      <span className="blog-card-cta">Read more →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
