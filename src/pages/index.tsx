import HomepageFeatures from "@site/src/components/HomepageFeatures";
import Heading from "@theme/Heading";
import Layout from "@theme/Layout";
import clsx from "clsx";

import styles from "./index.module.css";
import { useColorMode } from "@docusaurus/theme-common";

function HomepageHeader() {
  const { colorMode } = useColorMode();
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div
        style={{
          position: "absolute",
          inset: "0",
          overflow: "hidden",
        }}
        className={styles.circles}
      >
        {/* Credit to https://codepen.io/mohaiman/pen/MQqMyo */}
        {Array.from({ length: 10 }).map(() => (
          <li />
        ))}
      </div>
      <div className="container">
        <img
          src="/img/logo_transparent.png"
          alt="Transparent Logo"
          style={{
            height: "16rem",
            width: "16rem",
            filter: colorMode === "dark" && "invert()",
          }}
        />

        <Heading as="h2">Full-Stack and DevOps</Heading>
        <p style={{ fontWeight: "500" }}>
          Sharing thoughts, tips and tricks with the community.
        </p>
      </div>
      {/* <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Docusaurus Tutorial - 5min ⏱️
          </Link>
        </div> */}
    </header>
  );
}

export default function Home(): JSX.Element {
  return (
    <Layout description="Full-stack and DevOps">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
