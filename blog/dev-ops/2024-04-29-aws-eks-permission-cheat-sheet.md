---
slug: DevOps/aws-eks-addon-iam-cheat-sheet
title: AWS EKS Addon Policies Cheat Sheet
description: Utilize EKS blueprints for easier permission management.
authors: koby
toc_min_heading_level: 2
toc_max_heading_level: 4
tags:
  [
    DevOps,
    EKS,
    Kubernetes,
    AWS,
    IAM,
    Addon,
    LB Controller,
    Policy,
    EBS CSI,
    EFS CSI,
  ]
---

To provide basic functionality over your Kubernetes cluster, we often need to configure Addons (usually in the form of Helm charts).

Understanding which permissions are required for the Helm charts is cruicial. Too many permissions, and you open yourself up to a breach if the service account is compromised. Too little, and you will run into runtime issues.

Documentation around required permissions for each addon are often limited, and we have to scour google to find the best permissions.

## AWS EKS Blueprints

[EKS Blueprints](https://github.com/aws-quickstart/cdk-eks-blueprints) is an official repository managed by AWS, to provision EKS clusters using AWS CDK.

The repository contains a [`lib/addon`](https://github.com/aws-quickstart/cdk-eks-blueprints/tree/main/lib/addons) directory. Each addon defines required permissions for it to function.
The policies are nested inside some functions, but they're simple enough to understand and copy.

![LB Controller Policy](/blog/blueprint-lb-controller-policy.png)

For example -

- [LB Controller Policy](https://github.com/aws-quickstart/cdk-eks-blueprints/blob/main/lib/addons/aws-loadbalancer-controller/iam-policy.ts) - Allows provisioning of load balancers.
- [EBS CSI Driver Policy](https://github.com/aws-quickstart/cdk-eks-blueprints/blob/main/lib/addons/ebs-csi-driver/iam-policy.ts) - Allows creating EBS volumes on your cluster.
- [EFS CSI Driver Policy](https://github.com/aws-quickstart/cdk-eks-blueprints/blob/main/lib/addons/efs-csi-driver/iam-policy.ts) - Allows creating EFS volumes on your cluster.

We can further refine the search of all available policies by using GitHub search filters. The [following filter](https://github.com/search?q=repo%3Aaws-quickstart%2Fcdk-eks-blueprints%20path%3A%2F%5Elib%5C%2Faddons%5C%2F%2F%20path%3A*polic*.ts&type=code) will find all files containing `polic` in the `lib/addons` folder:

```
repo:aws-quickstart/cdk-eks-blueprints path:/^lib\/addons\// path:*polic*.ts
```

## How to use

:::warning

**I do not recommend** using the blueprints directly for serious environments

- The code is overly complex, and a lot of it is auto-generated.
- Addons should be managed using GitOps in production clusters, not AWS CDK.

:::

If you're unsure about permissions for a specific addon, you can look at the EKS blueprints to help you figure them out. This is not a catch-all solution, but it may help you define fine grained permissions for your addons.

You can take these permissions, and copy them to your Terraform / Pulumi / AWS CDK code, and reference the blueprints.

## Useful links

- **Addon** is a [helm chart](https://helm.sh/) that adds functionality to your cluster ()
- [**EKS**](https://docs.aws.amazon.com/whitepapers/latest/overview-deployment-options/amazon-elastic-kubernetes-service.html) is the managed Kubernetes solution on AWS
- [**IAM**](https://aws.amazon.com/iam/) is the security engine for creating users, roles and policies.
