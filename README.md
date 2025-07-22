# 🧪 Full Lifecycle DevOps Project – Express Stack on AWS ECS Fargate

![CI](https://github.com/janus-dev/tv-devops-assessment/actions/workflows/build-and-deploy.yml/badge.svg)

This project is a complete solution to the [TurboVets DevOps Assessment](#), implementing a containerized Express.js application with AWS infrastructure managed by CDK for Terraform and CI/CD powered by GitHub Actions.

---

## 📁 Project Structure

| Folder   | Description |
|----------|-------------|
| `app/`   | Express.js app with Docker, Docker Compose, and CI/CD workflows. See [app/README.md](./app/README.md). |
| `iac/`   | CDKTF (TypeScript) project defining AWS infrastructure. See [iac/README.md](./iac/README.md). |
| `s3-backend-setup/`   | S3 Terraform Backend with DynanmoDB as lock table. See [s3-backend-setup/README.md](./s3-backend-setup/README.md). |

---

## 🐣 Chicken-and-Egg Warnings

There are **two important bootstrapping considerations**:

1. **Terraform S3 Backend**
   - The remote backend (S3 + DynamoDB) must be manually created before running `cdktf deploy`.
   - You’ll find the required permissions and naming in the [s3-backend-setup/README.md](./s3-backend-setup/README.md).

2. **ECR Repository Must Exist Before Push**
   - The ECR repo is created by `cdktf`.
   - The first GitHub Actions run will fail at the image push step until you’ve run `cdktf deploy` at least once to create the repo.

---

## ⚙️ CI/CD Setup

GitHub Actions automates:

- Build & tag Docker image (`short SHA`)
- Push to ECR
- Deploy using `cdktf`

Environments supported:

| Git Ref             | Environment |
|---------------------|-------------|
| Any feature branch  | `dev`       |
| `main` branch       | `staging`   |
| Git tag (`v*`)      | `prod`      |

> Full instructions for configuring secrets/variables are in both `app/` and `iac/` READMEs.

---

## 🌐 /health Check

The deployed service exposes a `/health` route over HTTP (port 3000). Each environment has its own ECS cluster and ECR repo.

## 🖼️ Visual Proof of Deployment
To demonstrate that the infrastructure and application were deployed correctly across all environments, please refer to the following documentation containing screenshots:

👉 See [proof-of-deployment/README.md](./proof-of-deployment/README.md).

This includes:

- S3 + DynamoDB backend verification
- ECR repository existence
- ECS service running successfully
- CI/CD GitHub Actions history

---

## 📚 Referenced Docs

- [`app/README.md`](./app/README.md) – local dev, Docker, GitHub Actions setup
- [`iac/README.md`](./iac/README.md) – CDKTF stack, configuration, and deployment
- [`s3-backend-setup/README.md`](./s3-backend-setup/README.md) – Terraform S3 Backend setup with DynanmoDB as lock table
- [proof-of-deployment/README.md](./proof-of-deployment/README.md) - Visual Proof of Deployment
