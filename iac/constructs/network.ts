import { Construct } from "constructs";
import {
  vpc,
  subnet,
  securityGroup,
} from "@cdktf/provider-aws";

interface NetworkProps {
  vpcCidr: string;
  subnetCidr: string;
  availabilityZone: string;
  ingressPort: number;
}

export class Network extends Construct {
  public readonly vpc: vpc.Vpc;
  public readonly subnet: subnet.Subnet;
  public readonly ecsSecurityGroup: securityGroup.SecurityGroup;

  constructor(scope: Construct, id: string, props: NetworkProps) {
    super(scope, id);

    this.vpc = new vpc.Vpc(this, "Vpc", {
      cidrBlock: props.vpcCidr,
    });

    this.subnet = new subnet.Subnet(this, "Subnet", {
      vpcId: this.vpc.id,
      cidrBlock: props.subnetCidr,
      availabilityZone: props.availabilityZone,
      mapPublicIpOnLaunch: true,
    });

    this.ecsSecurityGroup = new securityGroup.SecurityGroup(this, "EcsSecurityGroup", {
      vpcId: this.vpc.id,
      ingress: [{
        protocol: "tcp",
        fromPort: props.ingressPort,
        toPort: props.ingressPort,
        cidrBlocks: ["0.0.0.0/0"],
      }],
      egress: [{
        protocol: "-1",
        fromPort: 0,
        toPort: 0,
        cidrBlocks: ["0.0.0.0/0"],
      }],
    });
  }
}
