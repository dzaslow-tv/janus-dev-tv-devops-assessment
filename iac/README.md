# Infrastructure as Code (IaC) Deliverables

This directory contains the infrastructure setup for the Express app service using **CDK for Terraform (TypeScript)**.

---

## 📦 Resources Managed

The stack provisions the following:

- 🐳 Amazon ECR repository
- 🚀 ECS service (Fargate)
- 🌐 VPC, subnets, and security groups
- 🔐 IAM roles with **least privilege**

---

## 🧱 CDKTF Constructs Breakdown
The infrastructure is modularized using reusable constructs defined in the constructs/ directory. Each construct encapsulates a specific piece of AWS infrastructure, making it easier to reason about and maintain.

```bash
constructs/
├── alarms.ts     # CloudWatch alarm for ECS service CPU usage
├── ecr.ts        # Amazon ECR repository for container images
├── ecs.ts        # ECS cluster, task definition, and service (Fargate)
├── iam.ts        # IAM roles and policies (least privilege)
├── logging.ts    # CloudWatch log group for ECS container logging
└── network.ts    # VPC, Subnet, and Security Group configuration
```
Construct Responsibilities

| File         | Purpose                                                              |
| ------------ | -------------------------------------------------------------------- |
| `ecr.ts`     | Defines a private ECR repository used to push/pull Docker images.    |
| `ecs.ts`     | Defines the ECS cluster, Fargate task definition, and service setup. |
| `iam.ts`     | Sets up minimal IAM execution roles for ECS tasks.                   |
| `logging.ts` | Creates a CloudWatch Log Group for application logs.                 |
| `network.ts` | Provisions a basic VPC with one subnet and a security group.         |
| `alarms.ts`  | Adds a CloudWatch alarm to monitor high CPU usage in ECS services.   |


Each construct is parameterized via environment context, .env, and/or cdktf.json to support multiple environments like dev, staging, and prod.

---

## ☁️ AWS Guidelines

- You may deploy this stack to **your own AWS account** for testing.
- ✅ Use configuration from:
  - `cdktf.json`
  - `.env` file (copy from .env.sample)
  - Environment variables

---

## ⚙️ Configuration

You can override deployment settings in several ways:

### 1. Using Environment Variables

Export environment variables before running CDKTF:

```bash
export AWS_REGION=us-east-1
export AWS_ACCOUNT_ID=123456789012
export TF_BACKEND_BUCKET=terraform-state-example
export TF_BACKEND_KEY=express-app-[dev,staging,prod]/terraform.tfstate
export TF_BACKEND_DYNAMODB_TABLE=terraform-lock-table
export TF_BACKEND_ENCRYPT=true
```

### 2. Using `.env` File

Create a `.env` file with your overrides:

```dotenv
AWS_REGION=us-east-1
TF_BACKEND_BUCKET=terraform-state-example
TF_BACKEND_KEY=cdktf/express-app-[dev,staging,prod]/terraform.tfstate
TF_BACKEND_DYNAMODB_TABLE=terraform-lock-table
TF_BACKEND_ENCRYPT=true
```

### 3. Using `cdktf.json` File

The cdktf.json file defines core settings for the CDKTF project, including the language, app entry point, and environment-specific context used to configure the AWS stack for dev, staging, and prod.

Each environment block under context provides its own settings for VPCs, ECS clusters, services, and more.

Sample Layout

```bash
"context": {
  "dev": { ... },
  "staging": { ... },
  "prod": { ... }
}
```

#### 📋 Environment Breakdown

Update the context values in `cdktf.json` to match your environment and resource naming conventions.

| Key            | dev                    | staging                    | prod               |
| -------------- | ---------------------- | -------------------------- | ------------------ |
| `ecrRepoName`  | `express-app-dev`         | `express-app-staging`         | `express-app`         |
| `clusterName`  | `express-app-cluster-dev` | `express-app-cluster-staging` | `express-app-cluster` |
| `serviceName`  | `express-app-service-dev` | `express-app-service-staging` | `express-app-service` |
| `stackName`    | `express-app-dev-stack`   | `express-app-staging-stack`   | `express-app-stack`   |
| `taskFamily`   | `express-app-task-dev`    | `express-app-task-staging`    | `express-app-task`    |
| `cpu`          | `256`                  | `512`                      | `1024`             |
| `memory`       | `512`                  | `1024`                     | `2048`             |
| `desiredCount` | `1`                    | `2`                        | `3`                |
| `port`         | `3000`                 | `3000`                     | `3000`             |
| `vpcCidr`      | `10.0.0.0/16`          | `10.1.0.0/16`              | `10.2.0.0/16`      |
| `subnetCidr`   | `10.0.1.0/24`          | `10.1.1.0/24`              | `10.2.1.0/24`      |
| `az`           | `us-east-1a`           | `us-east-1b`               | `us-east-1c`       |
| `ingressPort`  | `3000`                 | `3000`                     | `3000`             |


---

## 🚀 Deployment

```bash
ENV=dev cdktf deploy        # development
ENV=staging cdktf deploy    # staging
ENV=prod cdktf deploy       # production
```

This will create all infrastructure and deploy your service to AWS.

✅ Once complete, you should be able to reach your service at:

```
http://<ip-address>/health
```

---

## 🧨 Tear Down

⚠️ Note: ECR Repository Deletion
Terraform cannot delete an ECR repository if it contains images. To ensure the ECR resource is properly destroyed during cdktf destroy, you must manually delete all images in the repository first.

You can do this via:

AWS Console: Navigate to ECR → Select repository → Delete all images

AWS CLI:

```bash
aws ecr batch-delete-image \
  --repository-name <your-repo-name> \
  --image-ids $(aws ecr list-images --repository-name <your-repo-name> --query 'imageIds[*]' --output json)
```

To destroy everything provisioned:

```bash
ENV=dev cdktf destroy        # development
ENV=staging cdktf destroy    # staging
ENV=prod cdktf destroy       # production
```

Use with caution — this is **not reversible**.

#### note: ECR register must be empty or it would not be torn down
---

## 📝 Notes

- The generated `cdktf.out/` directory is not tracked in Git.
- Use separate stacks per environment (e.g., dev/staging/prod).
- Review IAM role policies to ensure **least privilege**.
