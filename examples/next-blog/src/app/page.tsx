import Link from "next/link";

export default function HomePage() {
  const defaultPageId = process.env.NOTION_PAGE_ID;

  return (
    <main>
      <h1>Notion ATS Next Blog</h1>
      <p>This example app renders Notion content via @notion-ats.</p>
      {defaultPageId ? (
        <p>
          View the default page: <Link href={`/posts/${defaultPageId}`}>/posts/{defaultPageId}</Link>
        </p>
      ) : (
        <p>
          Set <code>NOTION_PAGE_ID</code> in <code>.env.local</code> to enable the example route.
        </p>
      )}
    </main>
  );
}
