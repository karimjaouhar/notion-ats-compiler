import Image from "next/image";
import Link from "next/link";
import type { RendererComponents } from "@notion-ats/react";
import Prism from "prismjs";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-json";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-python";

const externalLinkDefaults = {
  rel: "noreferrer noopener",
  target: "_blank"
};

const allowedImageHosts = new Set([
  "files.notion.so",
  "secure.notion-static.com",
  "s3.us-west-2.amazonaws.com"
]);

const isInternalHref = (href: string): boolean => {
  if (href.startsWith("/") || href.startsWith("#")) return true;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return false;

  try {
    const input = new URL(href);
    const base = new URL(siteUrl);
    return input.origin === base.origin;
  } catch {
    return false;
  }
};

const isAllowedImageHost = (src: string): boolean => {
  try {
    const url = new URL(src);
    return allowedImageHosts.has(url.hostname);
  } catch {
    return false;
  }
};

export const nextComponents: Partial<RendererComponents> = {
  link: ({ href, rel, target, children }) => {
    if (isInternalHref(href)) {
      return <Link href={href}>{children}</Link>;
    }

    return (
      <a
        href={href}
        rel={rel ?? externalLinkDefaults.rel}
        target={target ?? externalLinkDefaults.target}
      >
        {children}
      </a>
    );
  },
  image: ({ src, alt, caption }) => {
    const useNextImage = isAllowedImageHost(src);

    return (
      <figure>
        {useNextImage ? (
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={800}
            unoptimized
            style={{ width: "100%", height: "auto" }}
          />
        ) : (
          <img src={src} alt={alt} />
        )}
        {caption ? <figcaption>{caption}</figcaption> : null}
      </figure>
    );
  }
  ,
  code: ({ language, code, caption }) => {
    const lang = (language || "text").toLowerCase();
    const grammar = Prism.languages[lang] ?? Prism.languages.plain;
    const highlighted = Prism.highlight(code, grammar, lang);

    return (
      <figure>
        <pre>
          <code
            className={`language-${lang}`}
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </pre>
        {caption ? <figcaption>{caption}</figcaption> : null}
      </figure>
    );
  }
};
