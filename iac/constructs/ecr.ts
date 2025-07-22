import { Construct } from "constructs";
import { EcrRepository } from "@cdktf/provider-aws/lib/ecr-repository";

interface EcrProps {
  repositoryName: string;
}

export class Ecr extends Construct {
  public readonly repository: EcrRepository;

  constructor(scope: Construct, id: string, props: EcrProps) {
    super(scope, id);

    this.repository = new EcrRepository(this, "EcrRepository", {
      name: props.repositoryName,
      imageTagMutability: "MUTABLE",
      imageScanningConfiguration: {
        scanOnPush: true,
      },
    });
  }
}
