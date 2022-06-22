import { Stack, StackProps, aws_ssm as ssm } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { StageProps } from './stage-props';
import { join } from 'path';
import { readFileSync } from 'fs';

export class VitaeBbsParamsStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps & StageProps) {
        super(scope, id, props);

        const suffix = props.stage[0].toUpperCase() + props.stage.slice(1);

        const params = JSON.parse(readFileSync(join(__dirname, "..", "settings", `${props.stage}.json`), 'utf8'));

        new ssm.StringParameter(this, 'DomainParameter', {
            allowedPattern: '.*',
            description: 'domain parameters',
            parameterName: `Domain${suffix}`,
            stringValue: JSON.stringify(params['domain']),
            tier: ssm.ParameterTier.STANDARD,
        });
    }
}
