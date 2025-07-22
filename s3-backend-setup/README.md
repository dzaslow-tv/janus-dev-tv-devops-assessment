# S3 Backend Setup Guide

This guide provides instructions for the one-time setup required to bootstrap the Terraform backend. This process involves creating an S3 bucket and a DynamoDB table to securely store and manage the Terraform state.

---

## Permissions

Ensure your AWS IAM user or role has the right permissions:
- S3:
    - "s3:CreateBucket",
    - "s3:GetBucketLocation",
    - "s3:PutBucketAcl",
    - "s3:PutBucketVersioning",
    - "s3:PutEncryptionConfiguration",
    - "s3:PutBucketPublicAccessBlock",
    - "s3:PutObject",
    - "s3:GetObject",
    - "s3:DeleteObject",
    - "s3:ListBucket",
    - "s3:ListBucketVersions",
    - "s3:GetBucketPolicy",
    - "s3:PutBucketPolicy"

- DynamoDB:
    - "dynamodb:CreateTable",
    - "dynamodb:DescribeTable",
    - "dynamodb:PutItem",
    - "dynamodb:GetItem",
    - "dynamodb:DeleteItem",
    - "dynamodb:UpdateItem",
    - "dynamodb:Scan",
    - "dynamodb:Query"

- General: 
    - "sts:GetCallerIdentity"


## Steps to Bootstrap Terraform Backend

1. Run the `create-tf-state-bucket.sh` script:
    ```bash
    ./scripts/create-tf-state-bucket.sh
    ```

2. The script will:
    - Create an S3 bucket with versioning and encryption enabled.
    - Apply a lifecycle policy to retain previous versions of objects for 90 days.
    - Create a DynamoDB table for state locking.

3. Note the output values:
    | **Output Name**       | **Value**            |
    |------------------------|----------------------|
    | S3 Bucket Name         | `terraform-state-99fc5720`  |
    | DynamoDB Table Name    | `terraform-lock-table` |

These values will be required for configuring the Terraform backend.

---

## Notes

- This setup is a **one-time process**. Do not rerun the script unless a disaster recovery scenario necessitates recreating the backend.
