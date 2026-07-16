import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { formatBlogDate } from "@/lib/blogs";

export default async function AdminBlogsPage() {
  const { data: blogs } = await supabaseAdmin()
    .from("blogs")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Blogs</h1>
        <div className="admin-page-header-actions">
          <Link href="/admin/blogs/new" className="btn btn-primary admin-add-btn">
            + New blog post
          </Link>
        </div>
      </div>

      {!blogs?.length ? (
        <div className="admin-placeholder">No blog posts yet.</div>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Published</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog.id}>
                  <td>
                    <strong>{blog.title}</strong>
                    <div className="admin-row-sub">/blogs/{blog.slug}</div>
                  </td>
                  <td>
                    <span
                      className={`admin-status-badge ${
                        blog.status === "published" ? "admin-status-live" : "admin-status-pending"
                      }`}
                    >
                      {blog.status}
                    </span>
                  </td>
                  <td>{blog.published_at ? formatBlogDate(blog.published_at) : "—"}</td>
                  <td className="admin-row-actions">
                    {blog.status === "published" && (
                      <a
                        href={`/blogs/${blog.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-btn"
                      >
                        View
                      </a>
                    )}
                    <Link href={`/admin/blogs/${blog.id}/edit`} className="admin-btn">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
