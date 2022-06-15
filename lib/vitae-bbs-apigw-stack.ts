import { Stack, StackProps, aws_lambda as lambda, aws_apigateway as apigw, aws_iam as iam, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { StageProps } from './stage-props';
import { join } from 'path';

export class VitaeBbsApigwStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps & StageProps) {
        super(scope, id, props);
        const suffix = props.stage[0].toUpperCase() + props.stage.slice(1)

        const role = new iam.Role(this, "ApolloFunctionRole", {
            assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
            path: "/service-role/",
            inlinePolicies: {
              CloudWatchWritePolicy: new iam.PolicyDocument({
                statements: [
                  new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: [
                      "logs:CreateLogGroup",
                      "logs:CreateLogStream",
                      "logs:PutLogEvents"
                    ],
                    resources: ["*"]
                  }),
                  new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: [
                        "dynamodb:BatchGetItem",
                        "dynamodb:BatchWriteItem",
                        "dynamodb:ConditionCheckItem",
                        "dynamodb:DeleteItem",
                        "dynamodb:DescribeStream",
                        "dynamodb:DescribeTable",
                        "dynamodb:GetItem",
                        "dynamodb:GetRecords",
                        "dynamodb:ListStreams",
                        "dynamodb:ListTables",
                        "dynamodb:PutItem",
                        "dynamodb:Query",
                        "dynamodb:Scan",
                        "dynamodb:UpdateItem",
                        "dynamodb:ListTables",
                        "dynamodb:ListTables",
                        "dynamodb:ListTables",
                        "dynamodb:ListTables",
                        "dynamodb:ListTables",
                    ],
                    resources: [
                        '*',
                    ]
                  })
                ]
              })
            }
          });
        
        const apolloFunction = new lambda.DockerImageFunction(this, 'Apollo', {
            description: 'Apollo',
            code: lambda.DockerImageCode.fromImageAsset(join(__dirname, '../../vitae-bbs-backend'), {}),
            role: role,
            timeout: Duration.seconds(30),
            memorySize: 1024,
        });

        
        const api = new apigw.RestApi(this, 'GraphQL API')
        api.root.addMethod('GET', new apigw.LambdaIntegration(apolloFunction));
        api.root.addMethod('POST', new apigw.LambdaIntegration(apolloFunction));
    }
}
