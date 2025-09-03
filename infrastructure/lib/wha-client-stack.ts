import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';

import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { EnvironmentConfig } from './config';

interface WhaClientStackProps extends cdk.StackProps {
  config: EnvironmentConfig;
}

export class WhaClientStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WhaClientStackProps) {
    super(scope, id, props);

    const { config } = props;

    // S3 Bucket for hosting the web app (private with OAC)
    const webBucket = new s3.Bucket(this, 'WebBucket', {
      bucketName: config.bucketName,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html', // SPA routing
      publicReadAccess: false, // Private bucket - only CloudFront can access
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // Block all public access
      removalPolicy: config.environment === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: config.environment !== 'prod',
    });

    // Origin Access Control for CloudFront (modern approach)
    const originAccessControl = new cloudfront.CfnOriginAccessControl(this, 'OriginAccessControl', {
      originAccessControlConfig: {
        name: `${config.environment}-wha-client-oac`,
        originAccessControlOriginType: 's3',
        signingBehavior: 'always',
        signingProtocol: 'sigv4',
        description: `OAC for ${config.environment} WHA Client web app`,
      },
    });

    // SSL Certificate from separate certificate stack
    let certificate: certificatemanager.ICertificate | undefined;
    if (config.domainName) {
      if (config.certificateArn) {
        // Use certificate ARN from certificate stack
        certificate = certificatemanager.Certificate.fromCertificateArn(
          this, 
          'SSLCertificate', 
          config.certificateArn
        );
      } else {
        // Import certificate from cross-stack reference
        const certificateArn = cdk.Fn.importValue(`${config.environment}-certificate-arn`);
        certificate = certificatemanager.Certificate.fromCertificateArn(
          this, 
          'SSLCertificate', 
          certificateArn
        );
      }
    }

    // CloudFront Distribution with OAC
    const distribution = new cloudfront.CfnDistribution(this, 'Distribution', {
      distributionConfig: {
        comment: config.cloudFrontComment,
        enabled: true,
        defaultRootObject: 'index.html',
        aliases: config.domainName ? [config.domainName] : undefined,
        viewerCertificate: config.domainName && certificate ? {
          acmCertificateArn: certificate.certificateArn,
          sslSupportMethod: 'sni-only',
          minimumProtocolVersion: 'TLSv1.2_2021',
        } : {
          cloudFrontDefaultCertificate: true,
        },
        origins: [{
          id: 'S3Origin',
          domainName: webBucket.bucketDomainName,
          originAccessControlId: originAccessControl.attrId,
          s3OriginConfig: {
            originAccessIdentity: '', // Empty for OAC
          },
        }],
        defaultCacheBehavior: {
          targetOriginId: 'S3Origin',
          viewerProtocolPolicy: 'redirect-to-https',
          allowedMethods: ['GET', 'HEAD', 'OPTIONS'],
          cachedMethods: ['GET', 'HEAD', 'OPTIONS'],
          compress: true,
          cachePolicyId: '658327ea-f89d-4fab-a63d-7e88639e58f6', // Managed-CachingOptimized
        },
        customErrorResponses: [
          {
            errorCode: 404,
            responseCode: 200,
            responsePagePath: '/index.html',
            errorCachingMinTtl: 1800,
          },
          {
            errorCode: 403,
            responseCode: 200,
            responsePagePath: '/index.html',
            errorCachingMinTtl: 1800,
          },
        ],
        priceClass: 'PriceClass_100',
        httpVersion: 'http2and3',
      },
    });

    // Grant CloudFront access to S3 bucket via Origin Access Control
    webBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [webBucket.arnForObjects('*')],
        principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
        conditions: {
          StringEquals: {
            'AWS:SourceArn': `arn:aws:cloudfront::${this.account}:distribution/${distribution.ref}`,
          },
        },
      })
    );

    // Route 53 DNS Records (disabled for OAC implementation)
    // Note: Custom domain support can be added later if needed

    // IAM User for CI/CD deployments
    const deployUser = new iam.User(this, 'DeployUser', {
      userName: `wha-client-${config.environment}-deploy-user`,
    });

    // Policy for deployment user
    const deployPolicy = new iam.Policy(this, 'DeployPolicy', {
      policyName: `wha-client-${config.environment}-deploy-policy`,
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
            `arn:aws:cloudfront::${this.account}:distribution/${distribution.ref}`,
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
      value: distribution.ref,
      description: 'CloudFront Distribution ID',
    });

    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: distribution.attrDomainName,
      description: 'CloudFront Distribution Domain Name',
    });

    // Website URL output (using CloudFront domain)
    new cdk.CfnOutput(this, 'WebsiteURL', {
      value: `https://${distribution.attrDomainName}`,
      description: 'Website URL',
    });

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
