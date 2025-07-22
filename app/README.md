# App Deliverables

This guideline covers steps to set up the Express-based application, containerized with Docker. You can run the application locally using Docker Compose for convenience. This README also includes instructions for local development, Docker usage, and CI/CD via GitHub Actions.

---

## 📦 Project Structure

- `Dockerfile`: Builds and runs the Express app in production using Node.js 20 Alpine.
- `docker-compose.yml`: Docker Compose file to run the app and dependencies locally.
- `.github/workflows/`: GitHub Actions for testing, building, and deploying.
- `tsconfig.json`, `package.json`: TypeScript and dependency configs.

---

## 🛠️ Local Development

### 1. Clone the repo
```bash
git clone https://github.com/janus-dev/tv-devops-assessment
cd tv-devops-assessment/app
```

### 2. Install dependencies
```bash
npm ci
```

### 3. Run the app locally
```bash
npm run dev
```

> This uses `ts-node` for live TypeScript execution. App runs on [http://localhost:3000](http://localhost:3000).


### 3. Health check

To verify the app is up and running, visit http://localhost:3000/health and expect the following response:

```bash
{"status":"ok"}
```

---

## 🐳 Docker Usage

### Build the image
```bash
docker build -t express-app .
```

### Run the container
```bash
docker run -p 3000:3000 express-app
```

> The app listens on port `3000` inside the container.

---

## 📦 Docker Compose

If you're using `docker-compose.yml`, start everything with:

```bash
docker-compose up --build
```

---

## 🚀 CI/CD via GitHub Actions

This project is deployed using GitHub Actions, configured in:

```
.github/workflows/build-and-deploy.yml
```

### CI/CD Pipeline includes:

- ✅ Test execution
- 🐳 Docker image build & push to ECR
- ☁️ Infrastructure deployment using CDKTF (TypeScript)

### Triggered on:

- Push to any branch
- Push of Git tag `v*` (e.g., `v1.0.0`)

### Environments:

- `dev`: Feature branches
- `staging`: `main` branch
- `prod`: Git tags

### Required GitHub Action Secrets / Variables

Make sure the following are configured in **GitHub Repository Settings**:

| Name                         | Type     | Description                          |
|------------------------------|----------|--------------------------------------|
| AWS_ACCESS_KEY_ID            | Secret   | AWS access key ID                    |
| AWS_SECRET_ACCESS_KEY        | Secret   | AWS secret access key                |
| AWS_REGION                   | Variable | AWS region (e.g., `us-east-1`)       |
| AWS_ACCOUNT_ID               | Variable | AWS account ID                       |
| TF_BACKEND_BUCKET            | Variable | S3 bucket name for Terraform backend |
| TF_BACKEND_DYNAMODB_TABLE    | Variable | DynamoDB table name for state locks  |
| TF_BACKEND_ENCRYPT           | Variable | Whether to enable encryption (`true`)|

### Assume Role

Make sure the following two roles are created in the AWS account.

| Name                             |      Description                               |
|----------------------------------|------------------------------------------------|
| GithubActionsPushToECRRepository | Role to Handle ECR image publishing            |
| GitHubTerraformInfraRole         | Role to create infrastructure using Terraform  |

For the specific IAM permission required, check out
* https://docs.aws.amazon.com/AmazonECR/latest/userguide/image-push-iam.html
* https://docs.aws.amazon.com/prescriptive-guidance/latest/terraform-aws-provider-best-practices/security.html

---

## 🔐 Security

This app runs as a non-root `node` user in production (`Dockerfile`), and uses environment variables for runtime secrets. All CI/CD roles assume IAM roles via OIDC.

---
