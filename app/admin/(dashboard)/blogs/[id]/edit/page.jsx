import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import BlogForm from "@/components/admin/BlogForm";

export default async function EditBlogPage({ params }) {
  const { id } = params;
  const { data: blog } = await supabaseAdmin()
    .from("blogs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!blog) {
    notFound();
  }

  return (
    <div className="admin-form-page">
      <Link href="/admin/blogs" className="admin-form-back">
        ← Back to blogs
      </Link>
      <h1 className="admin-page-title">Edit blog post</h1>
      <BlogForm mode="edit" initial={blog} />
    </div>
  );
}
