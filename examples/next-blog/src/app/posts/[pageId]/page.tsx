import Link from "next/link";
import { compileNotionDatabaseIndex, compileNotionPage } from "@notion-ats/compiler";
import { ArticleRenderer } from "@notion-ats/react";
import { fetchDatabasePageBySlug, fetchDatabasePages, fetchPageWithBlocks } from "../../../lib/notion";
import { nextComponents } from "../../../lib/renderers";

export const revalidate = 3600;

type PageProps = {
  params: { pageId: string };
};

export default async function PostPage({ params }: PageProps) {
  const slugOrId = params.pageId;

  if (!process.env.NOTION_TOKEN) {
    return (
      <main>
        <h1>Missing NOTION_TOKEN</h1>
        <p>Set NOTION_TOKEN in .env.local to fetch data from Notion.</p>
      </main>
    );
  }

  if (!slugOrId) {
    return (
      <main>
        <h1>Missing slug</h1>
        <p>Visit /posts/[slug] or /posts/[pageId] with a Notion page ID.</p>
      </main>
    );
  }

  const warnings: string[] = [];

  try {
    let pageId = slugOrId;
    const databaseId = process.env.NOTION_DATABASE_ID;
    let relatedPosts: ReturnType<typeof compileNotionDatabaseIndex> = [];

    if (databaseId && !isLikelyNotionId(slugOrId)) {
      const { page } = await fetchDatabasePageBySlug(databaseId, slugOrId);
      if (page?.id) {
        pageId = page.id;
      }
    }

    const { page, blocks } = await fetchPageWithBlocks(pageId);
    const article = compileNotionPage({
      page,
      blocks,
      onWarning: (warning) => warnings.push(`${warning.code}: ${warning.message}`)
    });
    const authorImageUrl = getAuthorImageUrl(page?.properties);
    const readTime = getReadTimeMinutes(page?.properties);
    const formattedDate = article.meta.date ? formatDisplayDate(article.meta.date) : undefined;

    if (databaseId) {
      const { pages } = await fetchDatabasePages(databaseId);
      relatedPosts = compileNotionDatabaseIndex(pages).filter((post) => post.id !== pageId).slice(0, 3);
    }

    return (
      <main>
        <nav className="post-nav">
          <Link href="/posts">← Back to posts</Link>
        </nav>
        <header className="post-header">
          {article.meta.title ? <h1>{article.meta.title}</h1> : null}
          {article.meta.summary ? <p className="post-summary">{article.meta.summary}</p> : null}
          {(article.meta.author || readTime || formattedDate) ? (
            <div className="post-meta">
              <div className="post-author">
                {authorImageUrl ? <img src={authorImageUrl} alt="" /> : null}
                {article.meta.author ? <span className="post-author-name">{article.meta.author}</span> : null}
              </div>
              <div className="post-meta-details">
                {readTime ? <span>{readTime} min read</span> : null}
                {readTime && formattedDate ? <span>•</span> : null}
                {formattedDate ? <time dateTime={article.meta.date}>{formattedDate}</time> : null}
              </div>
            </div>
          ) : null}
        </header>
        {article.meta.coverUrl ? (
          <div className="post-hero">
            <img src={article.meta.coverUrl} alt="" />
          </div>
        ) : null}
        <ArticleRenderer article={article} components={nextComponents} />
        {relatedPosts.length > 0 ? (
          <section className="related-posts">
            <h2>Related posts</h2>
            <div className="related-grid">
              {relatedPosts.map((post) => {
                const href = post.slug ? `/posts/${post.slug}` : `/posts/${post.id}`;
                return (
                  <article key={post.id} className="related-card">
                    {post.coverUrl ? (
                      <div className="related-cover">
                        <img src={post.coverUrl} alt="" />
                      </div>
                    ) : null}
                    <h3>
                      <Link href={href}>{post.title}</Link>
                    </h3>
                    <div className="post-meta">
                      {post.date ? <time dateTime={post.date}>{post.date}</time> : null}
                      {post.author ? <span>{post.author}</span> : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}
        {warnings.length > 0 ? (
          <aside>
            <strong>Compiler warnings</strong>
            <ul>
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </aside>
        ) : null}
        <nav className="post-nav">
          <Link href="/posts">← Back to posts</Link>
        </nav>
      </main>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return (
      <main>
        <h1>Failed to load Notion page</h1>
        <p>{message}</p>
      </main>
    );
  }
}

function isLikelyNotionId(value: string): boolean {
  const normalized = value.replace(/-/g, "");
  return /^[0-9a-f]{32}$/i.test(normalized);
}

function getAuthorImageUrl(properties: Record<string, any> | undefined): string | undefined {
  const prop = properties?.["Author Image"];
  if (!prop) return undefined;
  if (prop.type === "files" && Array.isArray(prop.files)) {
    const file = prop.files[0];
    if (file?.type === "external") return file.external?.url;
    if (file?.type === "file") return file.file?.url;
  }
  if (prop.type === "url" && typeof prop.url === "string") return prop.url;
  return undefined;
}

function getReadTimeMinutes(properties: Record<string, any> | undefined): number | undefined {
  const prop = properties?.["Read Time"];
  if (!prop || prop.type !== "number") return undefined;
  return typeof prop.number === "number" ? prop.number : undefined;
}

function formatDisplayDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}
