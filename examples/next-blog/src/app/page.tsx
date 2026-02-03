import Link from "next/link";

export default function HomePage() {
  const defaultPageId = process.env.NOTION_PAGE_ID;
  const defaultDatabaseId = process.env.NOTION_DATABASE_ID;

  return (
    <main>
      <h1>Notion ATS Example Blog</h1>
      <p>
        This app shows how to fetch Notion content, compile it into the Article AST, and render it with
        <code> @notion-ats/react</code>. It includes a database-driven posts index and a single post route.
      </p>
      <div className="post-meta">
        <span>Routes:</span>
        <Link href="/posts">/posts</Link>
        {defaultPageId ? <Link href={`/posts/${defaultPageId}`}>/posts/{defaultPageId}</Link> : null}
      </div>
      {defaultDatabaseId ? (
        <p>
          Database index is enabled via <code>NOTION_DATABASE_ID</code>.
        </p>
      ) : (
        <p>
          Set <code>NOTION_DATABASE_ID</code> in <code>.env.local</code> to enable the posts index.
        </p>
      )}
      {defaultPageId ? null : (
        <p>
          Set <code>NOTION_PAGE_ID</code> in <code>.env.local</code> to enable the single post route.
        </p>
      )}
      <section>
        <h2>Setup checklist</h2>
        <ul>
          <li>Share your Notion database + page with the integration token.</li>
          <li>Set NOTION_TOKEN in .env.local.</li>
          <li>Set NOTION_DATABASE_ID (for /posts) and NOTION_PAGE_ID (for /posts/[pageId]).</li>
        </ul>
      </section>
    </main>
  );
}
