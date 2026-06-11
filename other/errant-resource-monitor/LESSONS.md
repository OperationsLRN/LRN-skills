# LESSONS: errant-resource-monitor

## 2026-06-03 — Initial build (WebMeet cleanup win + Erik's request)

**Origin:** WebMeet cleanup discovered orphaned resources post-stack-delete (bill-monitor + aws-to-terraform already built; errant-resource-monitor wraps them into a scheduled monitor). Erik asked for this on AT Dev call 2026-06-03.

**Cost Explorer lag:** CE has a 24-hour lag on resource-level data and a 10-minute lag on account-level totals. Don't poll CE immediately after a delete — schedule the billing check 24h later.

**Security group orphan detection:** A security group is orphaned only if it has zero active network interfaces AND is not referenced as a source in any other SG rule. Simply checking `describe-network-interfaces` is not enough — also check inbound rules of other SGs.

**EBS snapshot AMI cross-check:** Before flagging a snapshot as orphaned, verify it's not registered as an AMI image: `aws ec2 describe-images --owners self` → check `BlockDeviceMappings[*].Ebs.SnapshotId`. Deleting an AMI-backing snapshot breaks the AMI.

**Do NOT auto-delete:** The skill reports and alerts; it never auto-deletes. User must confirm each deletion. This is intentional — orphaned resource analysis can have false positives (e.g., intentionally untagged resources like shared security groups).

**Wraps:** bill-monitor (spend threshold alerts) + aws-to-terraform (resource inventory). This skill adds the per-resource orphan detection layer on top.
