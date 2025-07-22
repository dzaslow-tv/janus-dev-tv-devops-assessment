import { App, TerraformStack, S3Backend } from "cdktf";
import { provider } from "@cdktf/provider-aws";
import { Construct } from "constructs";
import { Ecr } from "./constructs/ecr";
import { EcsServiceConstruct } from "./constructs/ecs";
import { EcsIam } from "./constructs/iam";
import { Network } from "./constructs/network";
import { Logging } from "./constructs/logging";
import { Alarms } from "./constructs/alarms";

import { getConfig } from "./lib/config";

const app = new App();
const config = getConfig();

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new provider.AwsProvider(this, "AWS", {
      region: config.awsRegion,
    });

    new S3Backend(this, {
      bucket: config.backend_bucket,
      key: config.backend_key,
      region: config.awsRegion,
      dynamodbTable: config.backend_dynamodb_table,
      encrypt: config.backend_encrypt === "true",
    });

    const network = new Network(this, "Network", {
      vpcCidr: config.vpcCidr,
      subnetCidr: config.subnetCidr,
      availabilityZone: config.az,
      ingressPort: parseInt(config.ingressPort),
    });

    const ecr = new Ecr(this, "Ecr", {
      repositoryName: config.ecrRepoName,
    });

    const iam = new EcsIam(this, "Iam");

    const logging = new Logging(this, "Logging", config.serviceName);

    new EcsServiceConstruct(this, "EcsService", {
      subnetIds: [network.subnet.id],
      securityGroupIds: [network.ecsSecurityGroup.id],
      executionRoleArn: iam.executionRole.arn,
      repositoryUrl: ecr.repository.repositoryUrl,
      imageTag: config.imageTag || "latest",
      clusterName: config.clusterName,
      taskFamily: config.taskFamily,
      cpu: config.cpu,
      memory: config.memory,
      desiredCount: config.desiredCount,
      port: config.port,
      serviceName: config.serviceName,
      logGroupName: logging.logGroup.name,
      awsRegion: config.awsRegion
    });

    new Alarms(this, "Alarms", {
      clusterName: config.clusterName,
      serviceName: config.serviceName,
    });
  }
}

new MyStack(app, config.stackName);

app.synth();
