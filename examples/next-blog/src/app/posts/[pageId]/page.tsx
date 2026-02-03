import { compileNotionPage } from "@notion-ats/compiler";
import { ArticleRenderer } from "@notion-ats/react";
import { fetchPageWithBlocks } from "../../../lib/notion";
import { nextComponents } from "../../../lib/renderers";

export const revalidate = 3600;

type PageProps = {
  params: { pageId: string };
};

export default async function PostPage({ params }: PageProps) {
  const pageId = params.pageId;

  if (!process.env.NOTION_TOKEN) {
    return (
      <main>
        <h1>Missing NOTION_TOKEN</h1>
        <p>Set NOTION_TOKEN in .env.local to fetch data from Notion.</p>
      </main>
    );
  }

  if (!pageId) {
    return (
      <main>
        <h1>Missing pageId</h1>
        <p>Visit /posts/[pageId] with a Notion page ID.</p>
      </main>
    );
  }

  const warnings: string[] = [];

  try {
    const { page, blocks } = await fetchPageWithBlocks(pageId);
    const article = compileNotionPage({
      page,
      blocks,
      onWarning: (warning) => warnings.push(`${warning.code}: ${warning.message}`)
    });

    return (
      <main>
        {article.meta.title ? <h1>{article.meta.title}</h1> : null}
        <ArticleRenderer article={article} components={nextComponents} />
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
