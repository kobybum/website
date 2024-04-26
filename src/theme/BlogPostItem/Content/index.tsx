import React from "react";
import { blogPostContainerID } from "@docusaurus/utils-common";
import type ContentType from "@theme/BlogPostItem/Content";
import type { WrapperProps } from "@docusaurus/types";
import Giscus from "@giscus/react";
import MDXContent from "@theme/MDXContent";
import { useBlogPost } from "@docusaurus/theme-common/internal";

import { useColorMode } from "@docusaurus/theme-common";
import clsx from "clsx";

type Props = WrapperProps<typeof ContentType>;

export default function ContentWrapper({
  children,
  className,
}: Props): JSX.Element {
  const { colorMode } = useColorMode();
  const { isBlogPostPage } = useBlogPost();

  const giscus = (
    <Giscus
      id="comments"
      repo="kobybum/website"
      repoId="R_kgDOLznYBA"
      category="General"
      categoryId="DIC_kwDOLznYBM4Ce-R7"
      mapping="pathname"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme={colorMode}
      lang="en"
      loading="lazy"
    />
  );
  return (
    <div
      // This ID is used for the feed generation to locate the main content
      id={isBlogPostPage ? blogPostContainerID : undefined}
      className={clsx("markdown", className)}
      itemProp="articleBody"
    >
      <MDXContent>
        {children}
        {isBlogPostPage && giscus}
      </MDXContent>
    </div>
  );
}
