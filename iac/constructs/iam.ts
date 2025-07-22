import { Construct } from "constructs";
import {
  iamRole,
  iamRolePolicyAttachment,
} from "@cdktf/provider-aws";

export class EcsIam extends Construct {
  public readonly executionRole: iamRole.IamRole;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.executionRole = new iamRole.IamRole(this, "ExecutionRole", {
      name: "ecs_task_execution_role",
      assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
          Effect: "Allow",
          Principal: { Service: "ecs-tasks.amazonaws.com" },
          Action: "sts:AssumeRole",
        }],
      }),
    });

    new iamRolePolicyAttachment.IamRolePolicyAttachment(this, "ExecutionPolicy", {
      role: this.executionRole.name,
      policyArn: "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
    });
  }
}
