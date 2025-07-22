import { Construct } from "constructs";
import { cloudwatchMetricAlarm } from "@cdktf/provider-aws";

interface AlarmsProps {
    clusterName: string;
    serviceName: string;
}

export class Alarms extends Construct {
  constructor(scope: Construct, id: string, props: AlarmsProps) {
    super(scope, id);

    new cloudwatchMetricAlarm.CloudwatchMetricAlarm(this, "HighCPU", {
      alarmName: `${props.serviceName}-high-cpu`,
      comparisonOperator: "GreaterThanThreshold",
      evaluationPeriods: 2,
      metricName: "CPUUtilization",
      namespace: "AWS/ECS",
      period: 60,
      statistic: "Average",
      threshold: 80,
      alarmDescription: "Triggered when ECS service CPU > 80%",
      dimensions: {
        ClusterName: props.clusterName,
        ServiceName: props.serviceName,
      },
    });
  }
}
