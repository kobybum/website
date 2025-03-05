---
slug: DevOps/cdk-config
title: "CDK Config with @cdklib/config"
description: A lightweight, type-safe configuration management library for AWS CDK, cdktf, and cdk8s projects
authors: koby
toc_min_heading_level: 2
toc_max_heading_level: 3
tags:
  [
    DevOps,
    AWS,
    CDK,
    cdktf,
    cdk8s,
    Infrastructure as Code,
    TypeScript,
    Configuration Management,
    Cloud,
  ]
date: 2025-03-05
---

# CDK Configuration

## Preface

Over the last 3 years I've started numerous IAC projects that utilized CDKs heavily -

- AWS CDK for CloudFormation template generation
- `cdktf` for intrastructure as code with Terraform
- `cdk8s` with ArgoCD for Kubernetes

The main reason I like this stack so much, is the type-safety and easier learning curve that it provides.

New people can easily navigate in the project, with the best intelisense and type safety that TypeScript can provide.

While I really recommend using these tools, it's an emerging technology and hard to migrate to. If you're starting a new project, or a new company, I'd highly recommend you consider them.

I'll cover these topics more thoroughly in future posts, but for now I'll focus on the configuration library that I've been developing over the last few years.

:::note

I've met, and talked to many DevOps engineers who are against using anything other than plain Terraform and Helm. I've converted some of them, but as they say -

Different strokes for different folks.

:::

## Configuration

Have you ever struggled with managing configuration across your dev, staging, and prod environments? You're not alone. While tools like Terragrunt (for Terraform) and Helm (for Kubernetes) handle this beautifully, we've been missing something similar in the CDK world.

That's why I built `@cdklib/config` - a simple, type-safe configuration library for CDK projects. Whether you're using AWS CDK, cdktf, or cdk8s, this tool can help bring some sanity to your infrastructure code.

## The Configuration Headache in CDK

If you've worked on CDK projects with multiple environments, you've probably faced these issues:

- Values hard-coded all over your code
- Messy if/else statements for different environments
- No type checking for your config values
- Each team member handling config differently

These issues might not matter much in small projects, but they become real headaches as things grow.

Another issue you may encounter, is having to copy a bunch of role ARNs to your Kubernetes / Helm charts.

## How @cdklib/config Helps

This library brings a simple approach to configuration with several key benefits:

- **Type safety** - get TypeScript help with your configuration (using Zod for validation)
- **Nested environments** - organize configs like dev → dev/staging → dev/east/staging
- **Calculated values** - compute values based on environment and other settings
- **Modular design** - organize config logically for your needs
- **Easy CDK integration** - works with the CDK context system you already use

## Getting Started

Installing is simple:

```bash
npm install @cdklib/config
```

### Customizing Environment IDs (Optional)

By default, an environment ID is any string. This is undesirable, since it's prone to typos and mistakes.

For better type safety, you can define your own environment IDs in a `.d.ts` file:

```typescript
// cdklib-config.d.ts
declare module "@cdklib/config/types" {
  export type EnvId = "global" | "dev/staging" | "dev/qa" | "prod/us-central-1";
}
```

Then add this file to your `tsconfig.json`:

```json
{
  "include": ["...", "path/to/cdklib-config.d.ts"]
}
```

This gives you autocompletion for your environments when using `set` and `get` methods.

### Basic Example

Here's how to configure AWS account info across environments:

```typescript
import { CdkConfig } from "@cdklib/config";
import { z } from "zod";

// Define your configuration schema
const awsSchema = z.object({
  accountId: z.string(),
  region: z.string(),
  tags: z.record(z.string()).optional(),
});

// Create and configure
export const awsConfig = new CdkConfig(awsSchema)
  .setDefault({
    tags: { ManagedBy: "CDK" },
  })
  .set("dev", {
    accountId: "123456789012",
    region: "us-east-1",
    tags: { Environment: "development" },
  })
  .set("prod", {
    accountId: "987654321098",
    region: "us-west-2",
    tags: { Environment: "production" },
  });

// Get configuration for a specific environment
const devConfig = awsConfig.get("dev/staging");
console.log(devConfig);
// {
//   accountId: '123456789012',
//   region: 'us-east-1',
//   tags: { ManagedBy: 'CDK', Environment: 'development' }
// }
```

What I love about this approach:

1. Your configuration is **type-safe** - TypeScript helps you include all the required fields
2. It's **validated when you run it** - clear errors if you're missing something important, before you start applying your infrastructure
3. It's **all in one place** - no more hunting through code for environment settings

## Building Nested Environments

As projects grow, you often need more detailed environment definitions. The library makes this simple:

```typescript
export const awsConfig = new CdkConfig(awsSchema)
  .set("dev", {
    accountId: "123456789012",
    region: "us-east-1",
  })
  .set("dev/staging", {
    tags: { Environment: "staging" },
  });

const stagingConfig = awsConfig.get("dev/staging");
// {
//   accountId: '123456789012',  // Inherited from 'dev'
//   region: 'us-east-1',        // Inherited from 'dev'
//   tags: { Environment: 'staging' }
// }
```

Child environments inherit from sub paths, which means less copy-pasting and more consistency.

## Using Runtime Config for EKS Clusters

A common challenge is configuring resources consistently across environments. Here's a simple example for EKS clusters:

```typescript
// Define EKS configuration
const eksSchema = z.object({
  clusterName: z.string().optional(),
  nodeSize: z.string(),
  minNodes: z.number(),
  maxNodes: z.number(),
});

export const eksConfig = new CdkConfig(eksSchema)
  // Set base config for all environments
  .setDefault({
    nodeSize: "m5.large",
    minNodes: 2,
    maxNodes: 10,
  })
  // Set environment-specific values
  .set("staging", {
    minNodes: 2,
    maxNodes: 5,
  })
  .set("prod", {
    nodeSize: "m5.xlarge",
    minNodes: 3,
    maxNodes: 20,
  })
  // Add computed values that use the environment ID
  .addRuntime((envId, config) => {
    // Generate cluster name from environment ID if not specified
    const clusterName = config.clusterName || `${envId}-eks`;

    // Get AWS account details from another config
    const aws = awsConfig.get(envId);

    return {
      // Set the cluster name if not explicitly provided
      clusterName,

      // Generate the cluster ARN
      clusterArn: `arn:aws:eks:${aws.region}:${aws.accountId}:cluster/${clusterName}`,
    };
  });

// Usage
const stagingEks = eksConfig.get("staging");
console.log(stagingEks.clusterName); // "staging-eks"
console.log(stagingEks.clusterArn); // "arn:aws:eks:us-east-1:123456789012:cluster/staging-eks"

const prodEks = eksConfig.get("prod");
console.log(prodEks.nodeSize); // "m5.xlarge" - overridden for prod
console.log(prodEks.minNodes); // 3 - overridden for prod
console.log(prodEks.clusterName); // "prod-eks"
```

This approach lets you derive values based on the environment ID while still allowing overrides when needed. The runtime function gives you the flexibility to generate consistent resource names and ARNs across your infrastructure.

:::note

This is a simple example, I'd recommend you put this logic in a function like `getConsistentName` to follow your naming conventions.

For example - `dev-staging-eks` or `ProdUsCentral1Eks` (for you AWS CDK lovers).

:::

## Adding to Your CDK Projects

Integrating with CDK is straightforward:

```typescript
import { App, Stack } from "aws-cdk-lib";
import { getEnvId, initialContext } from "@cdklib/config";
import { awsConfig } from "./config/aws";
import { eksConfig } from "./config/eks";

// Initialize app with an environment context
const app = new App({
  context: initialContext("dev/staging"),
});

class MyInfraStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Get configuration for this environment
    const aws = awsConfig.get(this);
    const eks = eksConfig.get(this);

    // Use the configuration values in your constructs
    new eks.Cluster(this, "EksCluster", {
      clusterName: eks.clusterName,
      version: eks.version,
      nodeSize: eks.nodeSize,
      minNodes: eks.minNodes,
      maxNodes: eks.maxNodes,
      tags: aws.tags,
    });
  }
}
```

The `getEnvId` utility lets you access the environment ID from any construct, so you can get the right config wherever you need it.

Tags, specficially are better managed using [Aspects](https://developer.hashicorp.com/terraform/cdktf/concepts/aspects), which I'll cover separately

## CDKTF Integration

If you're using Terraform CDK, `@cdklib/config` works just as well with it. You can use either an app-per-environment or stack-per-environment approach, depending on your workflow. The library integrates seamlessly with the CDKTF context system, similar to how it works with AWS CDK.

Check out the readme for more examples of CDKTF integration.

## Wrapping Up

Managing configuration is one of those things that's easy to overlook but can make a huge difference in your daily CDK work. With `@cdklib/config`, you get a simple, type-safe way to handle configuration across all your CDK projects.

The library is lightweight and can dramatically simplify how you manage environment settings in your infrastructure code.

For more examples and best practices, take a look at the [project readme](https://github.com/kobybum/cdk-libs).

```bash
npm install @cdklib/config
```

One final note: this library is intentionally lightweight and simple by design.

The core functionality is just a few hundred lines of code, which means you can easily copy it into your project and modify it to fit your specific needs if you prefer.
