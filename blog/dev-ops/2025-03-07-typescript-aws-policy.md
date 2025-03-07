---
slug: DevOps/aws-policy
title: "TypeScript AWS Policies with @cdklib/aws-policy"
description: A lightweight typescript library for creating AWS IAM policies in TypeScript
authors: koby
toc_min_heading_level: 2
toc_max_heading_level: 3
tags:
  [DevOps, AWS, CDK, cdktf, Infrastructure as Code, TypeScript, Policy, Cloud]
date: 2025-03-07
---

# TypeScript AWS Policies with @cdklib/aws-policy

After working with AWS for a while, I've found myself writing the same IAM policy patterns over and over. Whether you're using CDK, Terraform, or just the AWS console, policy creation often involves copying JSON snippets and tweaking them for your specific resources.

I wanted a more TypeScript-friendly way to handle this common task, so I built `@cdklib/aws-policy` - a simple library that brings type safety to AWS IAM policies.

It's designed to work with any TypeScript project, whether you're using infrastructure as code tools or creating resources dynamically (tenant provisioning, etc).

## Life As We Know It

If you've worked with AWS IAM policies in TypeScript, you're probably familiar with awkward patterns like these:

```typescript
// Approach 1: JSON.stringify a raw object
const bucketPolicy = JSON.stringify({
  Version: "2012-10-17",
  Statement: [
    {
      Effect: "Allow",
      Action: ["s3:GetObject", "s3:ListBucket"],
      Resource: ["arn:aws:s3:::my-bucket", "arn:aws:s3:::my-bucket/*"],
    },
  ],
});

// Approach 2: Template literals
const bucketName = "app-assets";
const policyJson = `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::${bucketName}",
        "arn:aws:s3:::${bucketName}/*"
      ]
    }
  ]
}`;

// Approach 3: CDK policies with duplicated statement wrappers
new iam.PolicyDocument({
  statements: [
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["s3:GetObject", "s3:ListBucket"],
      resources: [`arn:aws:s3:::${bucketName}`, `arn:aws:s3:::${bucketName}/*`],
    }),
  ],
});
```

These approaches have several drawbacks:

- No TypeScript intellisense for action names or effect types
- Duplication of Version and Statement wrapper boilerplate (that never changes)
- Error-prone when you need to modify for multiple resources
- Inconsistent approaches across your codebase

## Life with `@cdklib/aws-policy`

At its core, `@cdklib/aws-policy` lets you:

1. Create policies with TypeScript instead of JSON
2. Get intellisense and type checking for your policy statements
3. Build reusable policy templates with parameters
4. Easily convert AWS examples into type-safe code

Let's look at how it works.

## Basic Usage

First, install the package:

```bash
npm install @cdklib/aws-policy
```

Here's a simple example of creating a policy:

```typescript
import { AwsPolicy } from "@cdklib/aws-policy";

// Create a policy with multiple statements
const bucketPolicy = AwsPolicy.from(
  {
    Effect: "Allow",
    Action: ["s3:GetObject", "s3:ListBucket"],
    Resource: ["arn:aws:s3:::my-bucket", "arn:aws:s3:::my-bucket/*"],
  },
  {
    Effect: "Deny",
    Action: "s3:DeleteObject",
    Resource: "arn:aws:s3:::my-bucket/*",
  }
);

// Get JSON output - the Version is automatically added
const policyJson = bucketPolicy.toJson();
```

This gives you the same JSON policy you'd write by hand, but with TypeScript's help along the way. If you try to use an invalid effect type or forget a required field, your editor will let you know immediately.

## Importing AWS Examples

Many times you just want to copy an example from the AWS docs and use it in your code.

The library makes it extremely easy - just copy paste the statements, and format-on-save will do the rest:

```typescript
// Example straight from AWS docs:
// {
//   "Effect": "Allow",
//   "Action": "s3:ListBucket",
//   "Resource": "arn:aws:s3:::example_bucket"
// }

// Import into TypeScript
const policy = AwsPolicy.from({
  Effect: "Allow",
  Action: "s3:ListBucket",
  Resource: "arn:aws:s3:::example_bucket",
});
```

You can also import existing policy JSON from files or APIs:

```typescript
const rawStatement = JSON.parse(fs.readFileSync("policy.json", "utf8"));
const importedPolicy = AwsPolicy.fromRaw(rawStatement);
```

## Reusable Policy Templates

As you build more AWS resources, you'll find yourself creating similar policies with slight variations. For example, you might need S3 bucket policies with different bucket names. That's where prepared policies become useful:

```typescript
import { AwsPreparedPolicy } from "@cdklib/aws-policy";

// Define a reusable policy template
const s3BucketPolicy = AwsPreparedPolicy.new<{
  bucketName: string;
}>((params) => ({
  Effect: "Allow",
  Action: ["s3:GetObject", "s3:ListBucket"],
  Resource: [
    `arn:aws:s3:::${params.bucketName}`,
    `arn:aws:s3:::${params.bucketName}/*`,
  ],
}));

// Use it for different buckets
const userDataPolicy = s3BucketPolicy.fill({
  bucketName: "user-data",
});

const appAssetsPolicy = s3BucketPolicy.fill({
  bucketName: "app-assets",
});

// You can also partially fill templates with .fillPartial() for progressive parameter filling
const partialPolicy = s3BucketPolicy.fillPartial({ bucketName: "user-data" });
const fullPolicy = partialPolicy.fill({ otherParam: "value" });
```

This approach helps eliminate duplicate code while keeping your policies type-safe.

## Integration with CdkConfig

If you're using the `@cdklib/config` library I mentioned in my [previous post](http://localhost:3001/blog/DevOps/cdk-config), you can create scope-aware prepared policies.

This gives you access to environment configuration (account id, region, cluster names, etc) when filling the policy:

```typescript
import { AwsPreparedPolicy } from "@cdklib/aws-policy";
import { awsConfig } from "./config";

// Define a policy that uses config from the scope
const s3BucketPolicy = AwsPreparedPolicy.newScoped<{
  bucketName: string;
}>((scope, { bucketName }) => {
  // Get config values from scope
  const { accountId, region } = awsConfig.get(scope);

  return {
    Effect: "Allow",
    Action: ["s3:GetObject", "s3:ListBucket"],
    Resource: [`arn:aws:s3:::${bucketName}`, `arn:aws:s3:::${bucketName}/*`],
    Principal: {
      AWS: `arn:aws:iam::${accountId}:root`,
    },
  };
});

// Use it in your construct
const policy = s3BucketPolicy.fill(this, {
  bucketName: "app-assets",
});
```

## Closing Thoughts

The `@cdklib/aws-policy` library is a small utility that makes working with AWS IAM policies a bit nicer in TypeScript projects.

The library is open source and available on GitHub, where you can find more examples and documentation. Feel free to use it, modify it, or build on it to fit your needs.

For more details and CDK libraries, check out the [project readme](https://github.com/kobybum/cdk-libs).
