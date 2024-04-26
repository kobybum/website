import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "Koby Bass - Dev Blog",
  tagline: "Jedi Dev",
  favicon: "img/favicon.ico",

  url: "https://koby.one",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        // docs: {
        //   sidebarPath: "./sidebars.ts",
        //   // Please change this to your repo.
        //   // Remove this to remove the "edit this page" links.
        //   editUrl:
        //     "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
        // },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  stylesheets: [],
  themeConfig: {
    // Replace with your project's social card
    image: "img/social-card.png",
    navbar: {
      title: "Koby Bass",
      logo: {
        alt: "Blog Logo",
        src: "img/logo-side.svg",
        srcDark: "img/logo-side-dark.svg",
      },
      items: [
        // {
        //   type: "docSidebar",
        //   sidebarId: "tutorialSidebar",
        //   position: "left",
        //   label: "Tutorial",
        // },
        { to: "/blog", label: "Dev Blog", position: "left" },
        {
          label: "GitHub",
          href: "https://github.com/kobybum/website",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Blog",
          items: [
            {
              label: "Blog",
              to: "/blog",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Medium",
              href: "https://medium.com/@kobybass",
            },
            {
              label: "Linkedin",
              href: "https://www.linkedin.com/in/koby-bass-922662a2",
            },
            {
              label: "GitHub",
              href: "https://github.com/kobybum",
            },
          ],
        },
        {
          title: "Blog",
          items: [
            {
              label: "Blog",
              to: "/blog",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Koby One. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
  plugins: [],
};

export default config;
