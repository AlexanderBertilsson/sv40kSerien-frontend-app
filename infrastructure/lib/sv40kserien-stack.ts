import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { EnvironmentConfig } from './config';

interface Sv40kSerienStackProps extends cdk.StackProps {
  config: EnvironmentConfig;
}

export class Sv40kSerienStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: Sv40kSerienStackProps) {
    super(scope, id, props);

    const { config } = props;

    // S3 Bucket for hosting the web app
    const webBucket = new s3.Bucket(this, 'WebBucket', {
      bucketName: config.bucketName,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html', // SPA routing
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: config.environment === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: config.environment !== 'prod',
    });

    // Origin Access Identity for CloudFront (legacy but stable)
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OriginAccessIdentity', {
      comment: `OAI for ${config.environment} web app`,
    });

    // SSL Certificate (if custom domain is used)
    let certificate: certificatemanager.ICertificate | undefined;
    if (config.domainName) {
      certificate = new certificatemanager.Certificate(this, 'Certificate', {
        domainName: config.domainName,
        validation: certificatemanager.CertificateValidation.fromDns(),
      });
    }

    // CloudFront Distribution
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      comment: config.cloudFrontComment,
      defaultBehavior: {
        origin: new origins.S3Origin(webBucket, {
          originAccessIdentity: originAccessIdentity,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        compress: true,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      additionalBehaviors: {
        '/static/*': {
          origin: new origins.S3Origin(webBucket, {
            originAccessIdentity: originAccessIdentity,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
          compress: true,
        },
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(30),
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(30),
        },
      ],
      domainNames: config.domainName ? [config.domainName] : undefined,
      certificate: certificate,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
    });

    // Grant CloudFront access to S3 bucket
    webBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [webBucket.arnForObjects('*')],
        principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
        conditions: {
          StringEquals: {
            'AWS:SourceArn': `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`,
          },
        },
      })
    );

    // Route 53 Hosted Zone and DNS Records (if custom domain is used)
    if (config.domainName) {
      let hostedZone: route53.IHostedZone;

      if (config.hostedZoneId && config.hostedZoneName) {
        // Use existing hosted zone
        hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
          hostedZoneId: config.hostedZoneId,
          zoneName: config.hostedZoneName,
        });
      } else {
        // Create new hosted zone
        hostedZone = new route53.HostedZone(this, 'HostedZone', {
          zoneName: config.domainName.includes('.') 
            ? config.domainName.split('.').slice(-2).join('.') 
            : config.domainName,
        });
      }

      // A record pointing to CloudFront distribution
      new route53.ARecord(this, 'AliasRecord', {
        zone: hostedZone,
        recordName: config.domainName,
        target: route53.RecordTarget.fromAlias(
          new targets.CloudFrontTarget(distribution)
        ),
      });

      // AAAA record for IPv6
      new route53.AaaaRecord(this, 'AliasRecordAAAA', {
        zone: hostedZone,
        recordName: config.domainName,
        target: route53.RecordTarget.fromAlias(
          new targets.CloudFrontTarget(distribution)
        ),
      });
    }

    // IAM User for CI/CD deployments
    const deployUser = new iam.User(this, 'DeployUser', {
      userName: `sv40kserien-${config.environment}-deploy-user`,
    });

    // Policy for deployment user
    const deployPolicy = new iam.Policy(this, 'DeployPolicy', {
      policyName: `sv40kserien-${config.environment}-deploy-policy`,
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            's3:PutObject',
            's3:PutObjectAcl',
            's3:GetObject',
            's3:DeleteObject',
            's3:ListBucket',
          ],
          resources: [
            webBucket.bucketArn,
            `${webBucket.bucketArn}/*`,
          ],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'cloudfront:CreateInvalidation',
          ],
          resources: [
            `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`,
          ],
        }),
      ],
    });

    deployUser.attachInlinePolicy(deployPolicy);

    // Outputs
    new cdk.CfnOutput(this, 'BucketName', {
      value: webBucket.bucketName,
      description: 'S3 Bucket name for web app deployment',
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
      description: 'CloudFront Distribution ID',
    });

    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: distribution.distributionDomainName,
      description: 'CloudFront Distribution Domain Name',
    });

    if (config.domainName) {
      new cdk.CfnOutput(this, 'WebsiteURL', {
        value: `https://${config.domainName}`,
        description: 'Website URL',
      });
    }

    new cdk.CfnOutput(this, 'DeployUserName', {
      value: deployUser.userName,
      description: 'IAM User for CI/CD deployments',
    });

    if (certificate) {
      new cdk.CfnOutput(this, 'CertificateArn', {
        value: certificate.certificateArn,
        description: 'SSL Certificate ARN',
      });
    }
  }
}
