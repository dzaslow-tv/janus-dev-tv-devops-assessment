import { Construct } from "constructs";
import {
  ecsCluster,
  ecsService,
  ecsTaskDefinition,
} from "@cdktf/provider-aws";

interface EcsProps {
    subnetIds: string[];
    securityGroupIds: string[];
    executionRoleArn: string;
    repositoryUrl: string;
    imageTag: string;
    clusterName: string;
    serviceName: string;
    taskFamily: string;
    cpu: string;
    memory: string;
    desiredCount: string;
    port: string;
    logGroupName: string;
    awsRegion: string;
}

export class EcsServiceConstruct extends Construct {
  public readonly cluster: ecsCluster.EcsCluster;

  constructor(scope: Construct, id: string, props: EcsProps) {
    super(scope, id);

    this.cluster = new ecsCluster.EcsCluster(this, "Cluster", {
      name: props.clusterName,
    });

    const taskDef = new ecsTaskDefinition.EcsTaskDefinition(this, "TaskDefinition", {
      family: props.taskFamily,
      cpu: props.cpu,
      memory: props.memory,
      networkMode: "awsvpc",
      requiresCompatibilities: ["FARGATE"],
      executionRoleArn: props.executionRoleArn,
      containerDefinitions: JSON.stringify([
        {
          name: props.serviceName,
          image: `${props.repositoryUrl}:${props.imageTag}`,
          portMappings: [{ containerPort: parseInt(props.port, 10) }],
          logConfiguration: {
            logDriver: "awslogs",
            options: {
              "awslogs-group": props.logGroupName,
              "awslogs-region": props.awsRegion,
              "awslogs-stream-prefix": "ecs",
            },
          },
        },
      ]),
    });

    new ecsService.EcsService(this, "Service", {
      name: props.serviceName,
      cluster: this.cluster.id,
      taskDefinition: taskDef.arn,
      desiredCount: parseInt(props.desiredCount),
      launchType: "FARGATE",
      networkConfiguration: {
        subnets: props.subnetIds,
        securityGroups: props.securityGroupIds,
        assignPublicIp: true,
      },
    });
  }
}
