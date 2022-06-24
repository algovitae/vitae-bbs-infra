import { Stack, StackProps, aws_lambda as lambda, aws_apigateway as apigw, aws_iam as iam, Duration, aws_route53 as route53, aws_certificatemanager as acm, aws_route53_targets as route53Targets, Stage } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { StageProps } from './stage-props';
import { join } from 'path';
import { readFileSync } from 'fs';

export class VitaeBbsApigwStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps & StageProps) {
    super(scope, id, props);


    const params = JSON.parse(readFileSync(join(__dirname, "..", "settings", `${props.stage}.json`), 'utf8'));
    const apiDomain = params.domain.api as string;
    const webDomain = params.domain.web as string;

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
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                "kms:DescribeKey",
                "kms:GetPublicKey",
                "kms:Sign",
              ],
              resources: ["*"],
              conditions: {
                "StringLike": {
                  "kms:RequestAlias": `alias/auth-${props.stage}`
                }
              }
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


    const api = new apigw.RestApi(this, 'GraphQL API', {
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
        allowHeaders: [...apigw.Cors.DEFAULT_HEADERS],
        statusCode: 200,
      }
    })
    api.root.addMethod('GET', new apigw.LambdaIntegration(apolloFunction));
    api.root.addMethod('POST', new apigw.LambdaIntegration(apolloFunction));


    const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: webDomain,
    });


    const certificate = new acm.DnsValidatedCertificate(this, 'Certificate', {
      domainName: apiDomain,
      hostedZone,
      region: 'us-east-1'
    });

    const domainNameApi = new apigw.DomainName(this, 'CustomDomain', {
      certificate: certificate,
      domainName: apiDomain,
      endpointType: apigw.EndpointType.EDGE,
      securityPolicy: apigw.SecurityPolicy.TLS_1_2,
    });
    domainNameApi.addBasePathMapping(
      api,
      {
        basePath: '',
      });

      
    const apiRecord = new route53.ARecord(this, 'ApiRecord', {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(
          new route53Targets.ApiGatewayDomain(domainNameApi)
      ),
      recordName: apiDomain,
    });
  }
}
