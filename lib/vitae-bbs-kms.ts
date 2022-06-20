import { Stack, StackProps, aws_kms as kms, Duration} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { StageProps } from './stage-props';

export class VitaeBbsKmsStack extends Stack {
    authKey: kms.Key;
    constructor(scope: Construct, id: string, props: StackProps & StageProps) {
        super(scope, id, props);
        
        const authKey = new kms.Key(this, 'AuthSigningKey', {
            alias: `alias/auth-${props.stage}`,
            keySpec: kms.KeySpec.ECC_NIST_P521,
            keyUsage: kms.KeyUsage.SIGN_VERIFY,
        });

        this.authKey = authKey;
    }
}
