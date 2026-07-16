import Link from "next/link";
import BlogForm from "@/components/admin/BlogForm";

export default function NewBlogPage() {
  return (
    <div className="admin-form-page">
      <Link href="/admin/blogs" className="admin-form-back">
        ← Back to blogs
      </Link>
      <h1 className="admin-page-title">New blog post</h1>
      <BlogForm mode="create" />
    </div>
  );
}
