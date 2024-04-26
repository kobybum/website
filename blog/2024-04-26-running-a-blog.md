---
slug: my-developer-blog
title: In-House Developer blog
authors: koby
tags: [blog, docosaurus, cloudflare, giscus]
---

:::info

The blog [GitHub repository](https://github.com/kobybum/website) is public, you're welcome to take a look :)

:::

Here's a quick explanation on why I decided to open my own blog, and how I manage it.

I will update it throughout the journey to keep you updated!

## Motivation

If you're considering creating your own blog, I'd encourage you to do so!

It's quite simple to do, and has some real advantages -

- You own your content, and can manage it in git.
- Your domain will gain popularity through SEO.
  - The older your domain and the more links it gets, the higher the SEO score.
  - → The quicker you start, the more your domain will be indexed.
- Helps attract clients as a contractor.

## Stack

The stack I use for the blog is quite simple -

- Domain name
- [Docosaurus](https://docusaurus.io/) - A facebook open-source for managing docs and blogs
  - Great tool for managing content
  - Support for [Mermaid diagrams](https://docusaurus.io/docs/markdown-features/diagrams)
  - Markdown renderer
  - [Code block renderer](https://docusaurus.io/docs/markdown-features/code-blocks)
- **Public** [GitHub repository](https://github.com/kobybum/website)
- [Cloudflare Pages](https://pages.cloudflare.com/) - Compeletely free CDN with CI/CD
- [Giscus](https://github.com/giscus/giscus) - For free comment management powered by GitHub discussions.
  - [Daniel Farlow](https://dwf.dev/blog/2022/10/27/2022/giscus-comments/) wrote a great post on how to integrate Giscus into Docosaurus.
