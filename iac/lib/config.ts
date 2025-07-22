import { App } from "cdktf";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

export interface Config {
  awsRegion: string;
  imageTag: string;
  backend_bucket: string;
  backend_key: string;
  backend_dynamodb_table: string;
  backend_encrypt: string;
  ecrRepoName: string;
  clusterName: string;
  serviceName: string;
  stackName: string;
  taskFamily: string;
  cpu: string;
  memory: string;
  desiredCount: string;
  port: string;
  vpcCidr: string;
  subnetCidr: string;
  az: string;
  ingressPort: string;
}

export function getConfig(): Config {
  const app = new App();
  const env = process.env.ENV || "dev";
  let ctx = app.node.tryGetContext(env) ?? {};

  // Fallback: read from cdktf.json if ctx is empty
  if (Object.keys(ctx).length === 0) {
    try {
      const raw = fs.readFileSync("cdktf.json", "utf-8");
      ctx = JSON.parse(raw).context || {};
    } catch (err) {
      console.warn("Could not read context from cdktf.json:", err);
    }
  }

  const region = process.env.AWS_REGION || ctx.awsRegion || "us-east-1";

  return {
    awsRegion: region,
    imageTag: process.env.IMAGE_TAG || ctx.imageTag || "latest",
    backend_bucket: process.env.TF_BACKEND_BUCKET || ctx.TF_BACKEND_BUCKET || "terraform-state-99fc5720",
    backend_key: process.env.TF_BACKEND_KEY || ctx.TF_BACKEND_KEY || "express-app-dev/terraform.tfstate",
    backend_dynamodb_table: process.env.TF_BACKEND_DYNAMODB_TABLE || ctx.TF_BACKEND_DYNAMODB_TABLE || "terraform-lock-table",
    backend_encrypt: process.env.TF_BACKEND_ENCRYPT || ctx.TF_BACKEND_ENCRYPT || "true",
    ecrRepoName: ctx.ecrRepoName || "express-ts-app",
    clusterName: ctx.clusterName || "express-app-cluster",
    serviceName: ctx.serviceName || "express-app-service",
    stackName: ctx.stackName || `express-app-stack`,
    taskFamily: ctx.taskFamily || "express-app-task",
    cpu: ctx.cpu || "256",
    memory: ctx.memory || "512",
    desiredCount: ctx.desiredCount || "1",
    port: ctx.port || "3000",
    vpcCidr: ctx.vpcCidr || "10.0.0.0/16",
    subnetCidr: ctx.subnetCidr || "10.0.1.0/24",
    az: ctx.az || `${region}a`,
    ingressPort: ctx.ingressPort || "3000",
  };
}
