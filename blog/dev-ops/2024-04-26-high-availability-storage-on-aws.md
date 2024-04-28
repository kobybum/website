---
slug: DevOps/aws-ha-storage-rook
title: Kubernetes Multi-AZ Block Storage on AWS
description: Learn how to utilize Rook to support multi AZ deployments of Prometheus.
authors: koby
tags: [DevOps, EKS, Kubernetes, AWS, EBS, Prometheus, Rook, HA, Multi AZ]
---

## Why Multi-AZ EBS

A common problem people run into is deploying a high-availbity service on top of AWS EKS.

A few years ago, we deployed a Prometheus instance on AWS. Everything ran smoothly, until the availability zone went down.

Suddenly, the pod was unschedulable. We found out the hard way that EBS storage is restricted to the AZ it was created in.

If you want to build a highly available system, your storage needs to be highly available as well.

:::warning

While AWS EFS [supports Multi-AZ](https://docs.aws.amazon.com/efs/latest/ug/how-it-works.html) storage, many services require block storage.

Using the wrong storage may lead to [data corruption](https://github.com/prometheus-operator/prometheus-operator/issues/3150#issuecomment-623080635).

:::

## Prometheus Remediation

Prometheus in particular does not support cluster mode. It runs on a single instance, and to achieve HA you have to maintain 2 replicas that are polling all your pods.

If you decide to go with this solution, you can use [Node Selector](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity) or affinity to use a different AZ on each instance.

However, this raises a bigger problem in the Kubernetes ecosystem. Non-clustered, persistent services cannot be highly available out of the box.

## Enter Rook - Distributed Storage

[Rook](https://rook.io/) allows us to create a highly available, distributed storage on EKS.

Simply put, Rook:

- Spins up a Ceph cluster on multiple AZs with provisioned capacity
- Lets you define a [Storage Class](https://kubernetes.io/docs/concepts/storage/storage-classes/)
- PVCs (persistent volume claims) can then use this storage class for multi AZ

Rook has been a [CNCF graduate](https://www.cncf.io/projects/rook/) since 2020, so it's extremely stable.

### Rook Setup

:::note

Install Rook using a Helm Chart managed in GitOp.

The video demonstrates basic Rook setup, but I'd recommend using Helm with CRDs to facilitate GitOps.

:::

There's a [great video](https://www.youtube.com/watch?v=DYofW39Q5Z8) by Red Hat Developer on how to set up Rook on AWS. Here are a few tips from my side -
