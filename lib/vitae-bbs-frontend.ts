import { Stack, StackProps, aws_s3 as s3, aws_cloudfront as cloudfront, aws_iam as iam, aws_route53 as route53, aws_certificatemanager as acm, RemovalPolicy, Duration, aws_cloudfront_origins, aws_route53_targets } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { StageProps } from './stage-props';
import { join } from 'path';
import { readFileSync } from 'fs';

export class VitaeBbsFrontendStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps & StageProps) {
        super(scope, id, props);

        const suffix = props.stage[0].toUpperCase() + props.stage.slice(1);

        const params = JSON.parse(readFileSync(join(__dirname, "..", "settings", `${props.stage}.json`), 'utf8'));


        const apiDomain = params.domain.api as string;
        const webDomain = params.domain.web as string;

        const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
            domainName: webDomain,
        });

        const certificate = new acm.DnsValidatedCertificate(this, 'Certificate', {
            domainName: webDomain,
            hostedZone,
            region: 'us-east-1'
        });


        const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
            bucketName: `website-${params.domain.web}`,
            removalPolicy: RemovalPolicy.DESTROY,
        });

        const originAccessIdentity = new cloudfront.OriginAccessIdentity(
            this,
            'OriginAccessIdentity',
            {
                comment: `web-${props.stage}`,
            }
        );

        const webSiteBucketPolicyStatement = new iam.PolicyStatement({
            actions: ['s3:GetObject'],
            effect: iam.Effect.ALLOW,
            principals: [
                new iam.CanonicalUserPrincipal(
                    originAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId
                ),
            ],
            resources: [`${websiteBucket.bucketArn}/*`],
        });

        websiteBucket.addToResourcePolicy(webSiteBucketPolicyStatement);

        const distribution = new cloudfront.Distribution(this, 'distribution', {
            defaultRootObject: 'index.html',
            certificate,
            domainNames: [webDomain],
            errorResponses: [
                {
                    ttl: Duration.seconds(300),
                    httpStatus: 403,
                    responseHttpStatus: 403,
                    responsePagePath: '/error.html',
                },
                {
                    ttl: Duration.seconds(300),
                    httpStatus: 404,
                    responseHttpStatus: 404,
                    responsePagePath: '/error.html',
                },
            ],
            defaultBehavior: {
                allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
                cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
                cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
                viewerProtocolPolicy:
                    cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                origin: new aws_cloudfront_origins.S3Origin(websiteBucket, {
                    originAccessIdentity,
                }),
            },
            priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
        });


        new route53.ARecord(this, 'Route53RecordSetA', {
            recordName: webDomain,
            zone: hostedZone,
            target: route53.RecordTarget.fromAlias(
                new aws_route53_targets.CloudFrontTarget(distribution)
            ),
        });

        new route53.AaaaRecord(this, 'Route53RecordSetAAAA', {
            recordName: webDomain,
            zone: hostedZone,
            target: route53.RecordTarget.fromAlias(
                new aws_route53_targets.CloudFrontTarget(distribution)
            ),
        });
    }
}
