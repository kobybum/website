import HomepageFeatures from "@site/src/components/HomepageFeatures";
import Heading from "@theme/Heading";
import Layout from "@theme/Layout";
import clsx from "clsx";

import styles from "./index.module.css";

function HomepageHeader() {
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          Koby Bass
        </Heading>
        <Heading as="h2">Full-Stack and DevOps</Heading>
        <p>I'm a passionate DevOps engineer and full-stack developer.</p>
        <p>
          This is my personal blog, meant to share my thoughts, tips and tricks
          with the community.
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
    <Layout description="Full-stack developer and DevOps engineer">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
