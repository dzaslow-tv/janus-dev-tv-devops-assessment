import { Construct } from "constructs";
import { cloudwatchLogGroup } from "@cdktf/provider-aws";

export class Logging extends Construct {
  public readonly logGroup: cloudwatchLogGroup.CloudwatchLogGroup;

  constructor(scope: Construct, id: string, logGroupName: string) {
    super(scope, id);

    this.logGroup = new cloudwatchLogGroup.CloudwatchLogGroup(this, "LogGroup", {
      name: logGroupName,
      retentionInDays: 14,
    });
  }
}
