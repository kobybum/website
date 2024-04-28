---
slug: DevOps/aws-ha-block-storage-rook
title: Kubernetes Multi-AZ Block Storage on AWS
description: Learn how to utilize Rook to support multi AZ deployments of Prometheus.
authors: koby
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: true
tags:
  [
    DevOps,
    EKS,
    Kubernetes,
    AWS,
    EBS,
    Prometheus,
    Rook,
    HA,
    Multi AZ,
    Block Storage,
  ]
---

This blog post is about high availbility block storage on AWS EKS.

The provided block storage, EBS, does not replicate across regions. This has major implications during AZ downtime.
A
We explore how Rook, an CNCF distibuted storage solution, can be used to provide a better infrastrcutre. We look at the pros and cons of managing a Rook cluster and some use-cases for it.

## Why do I need distributed block storage?

A common problem people run into is deploying a high-availbity service on top of AWS EKS.

A few years ago, we deployed a Prometheus instance on AWS. Everything ran smoothly, until the availability zone went down.

Suddenly, the pod was unschedulable. We found out the hard way that EBS storage is restricted to the AZ it was created in.

If you want to build a highly available system, your storage needs to be highly available as well.

:::warning

While AWS EFS [supports Multi-AZ](https://docs.aws.amazon.com/efs/latest/ug/how-it-works.html) storage, many services require block storage.

Using the wrong storage may lead to [data corruption](https://github.com/prometheus-operator/prometheus-operator/issues/3150#issuecomment-623080635).

:::

## Rook - Distributed Storage

[Rook](https://rook.io/) allows us to create a highly available, distributed storage on EKS.

Simply put, Rook:

- Spins up a Ceph cluster on multiple AZs with provisioned capacity
- Lets you define a [Storage Class](https://kubernetes.io/docs/concepts/storage/storage-classes/)
- PVCs (persistent volume claims) can then use this storage class for multi AZ

Rook has been a [CNCF graduate](https://www.cncf.io/projects/rook/) since 2020, so it's extremely stable.

### Setup

:::note

Install Rook using a Helm Chart managed in GitOp.

The video demonstrates basic Rook setup, but I'd recommend using Helm with CRDs to facilitate GitOps.

:::

There's a [great video](https://www.youtube.com/watch?v=DYofW39Q5Z8) by Red Hat Developer on how to set up Rook on AWS.

I'd recommend installing Rook using the [Rook Ceph helm chart](https://rook.io/docs/rook/latest-release/Helm-Charts/operator-chart/) to provision the Ceph cluster to better integrate with your GitOps environment.

### Considerations

- Rook comes with a signicant learning curve for understanding and using Ceph
- Ceph requires a lot of resources
  - Multi AZ requires multiple instance
  - Minimum recommended storage of 100GB per node (totalling 300GB for the cluster)

For the above reasons, to fully utilize and justify deploying Rook, you should have high storage requirements and justify the cost overhead of doing so.

### Use Cases

#### Prometheus High Availability

:::tip

Without Rook, you can [setup 2 prometheus instances](https://github.com/prometheus-operator/prometheus-operator/blob/main/Documentation/high-availability.md) with the same configuration for an HA setup.

If you decide to go with this solution, you can use [Node Selector](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity) or affinity to use a different AZ on each instance.

:::

Prometheus is a great candidate for Rook:

- Prometheus scans metrics perdiocially (usually every 30 seconds)
  - having it down for two minutes is not a deal breaker.
- Simplifies the HA setup for Prometheus
- Removes the need to send duplicate metrics to third parties which can get expensive.

#### Kafka

Kafka [relies on block storage](https://strimzi.io/docs/operators/0.22.1/full/using#considerations-for-data-storage-str) which means the storage will not be available during AZ downtime.

While distributed by design, this has performance implications on your cluster. Here's a quick breakdown of how Kafka manages partitions:

- Topics are partitioned and **saved to disk**.
- Partitions are **replicated** across brokers using a replication factor.
- Each partition is assigned a [partition leader](https://stackoverflow.com/questions/60835817/what-is-a-partition-leader-in-apache-kafka) that serves all reads and writes to the parition.

:::info

MSK relies on EBS behind the scenes, so it doesn't solve these issues.

:::

Using distributed storage will allow you to avoid the following Kafka shortcomings:

<details>

<summary>

Scenario 1 - (Likely) new parition leader is elected

</summary>

:::tip

Without distributed storage, you can mitigate this shortcomings this by over-provisioning to 150% (depending on your number of AZs) of your cluster usage.

:::

- AZ goes down
- A new parition leader is elected
- All requests are routed to the new leader

While this looks OK on paper, there's an underlying problem. Only 66% of you cluster available!

The new parition leaders will have a lot more work to do, stalling your cluster throughput. Depending on the parition assignments, it may lead to siginificant lag in your system.

</details>

<details>

<summary>

Scenario 2 - (Unfortunate) All partitions are on the same AZ

</summary>

:::warning

Without distributed storage, I'm unaware of any non-manual method to verify this doesn't happen.

:::

If all partitions are in the same AZ, the entire partition data is lost.

If you're using MSK or Strimzi, in both cases, your **data will be unavailable** until the AZ is available again.

This can happen when:

- Replication factor is set to 0
- Multiple brokers are running on the same AZ, and the paritions were assigned to them..

</details>

With distributed storage in place, in both scenarios the broker will reschedule on another AZ.

#### Notable Mentions

- Redis (in non-cluster mode), can benefit from distributed storage.

### Summary (TL;DR)

Overall, distributed storage can be very useful, and Rook provides an easy setup for it.

Higher costs and Ceph maintenance should be considered and weighted against other disaster scenarios to understand whether it's worth it.

The larger your cluster and storage requirements, the more distributed storage becomes cost-efficient.

For non-production environments clusters, distributed storage makes little sense.

### Useful Links

- [Kafka - Considerations for data storage](https://strimzi.io/docs/operators/0.22.1/full/using#considerations-for-data-storage-str)
- [Prometheus high availability](https://github.com/prometheus-operator/prometheus-operator/blob/main/Documentation/high-availability.md)
