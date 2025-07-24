#!/bin/bash

# Script to create an S3 bucket for Terraform state storage
# NOTE: This script is meant to be run manually to address the "chicken and egg" problem
# where Terraform needs an S3 bucket to store its state, but the bucket itself cannot
# be created using Terraform without an existing state backend.

# Variables
DEFAULT_REGION=us-east-1
BUCKET_PREFIX=terraform-state
BUCKET_NAME="${BUCKET_PREFIX}-$(uuidgen | tr '[:upper:]' '[:lower:]' | cut -d'-' -f1)" # Unique bucket name
DYNAMODB_TABLE_NAME="tv-assessment-terraform-lock-table"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &>/dev/null; then
  echo "AWS CLI is not configured or credentials are invalid. Please configure the AWS CLI."
  exit 1
fi

# Create the S3 bucket
if ! aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$DEFAULT_REGION"; then
  echo "Failed to create S3 bucket. Exiting."
  exit 1
fi

# Enable versioning on the bucket
echo "Enabling versioning on the bucket..."
if ! aws s3api put-bucket-versioning --bucket "$BUCKET_NAME" --versioning-configuration Status=Enabled; then
  echo "Failed to enable versioning on the bucket. Exiting."
  exit 1
fi

# Enable default encryption on the bucket
echo "Enabling default encryption on the bucket..."
if ! aws s3api put-bucket-encryption --bucket "$BUCKET_NAME" --server-side-encryption-configuration '{
  "Rules": [
    {
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }
  ]
}'; then
  echo "Failed to enable encryption on the bucket. Exiting."
  exit 1
fi

# Set lifecycle policy for version retention
echo "Setting lifecycle policy for version retention (90 days)..."
LIFECYCLE_POLICY=$(cat <<EOF
{
  "Rules": [
    {
      "ID": "RetainPreviousVersions",
      "Status": "Enabled",
      "Filter": {},
      "NoncurrentVersionExpiration": {
        "NoncurrentDays": 90
      }
    }
  ]
}
EOF
)
if ! aws s3api put-bucket-lifecycle-configuration --bucket "$BUCKET_NAME" --lifecycle-configuration "$LIFECYCLE_POLICY"; then
  echo "Failed to set lifecycle policy on the bucket. Exiting."
  exit 1
fi

# Create a DynamoDB table for state locking
echo "Creating DynamoDB table for state locking: $DYNAMODB_TABLE_NAME..."
if ! aws dynamodb create-table \
  --table-name "$DYNAMODB_TABLE_NAME" \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST; then
  echo "Failed to create DynamoDB table. Exiting."
  exit 1
fi

# Output the bucket name and DynamoDB table name
echo "S3 bucket and DynamoDB table created successfully."
echo "S3 Bucket Name: $BUCKET_NAME"
echo "DynamoDB Table Name: $DYNAMODB_TABLE_NAME"