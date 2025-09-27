import * as cdk from 'aws-cdk-lib';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';
import { EnvironmentConfig } from './config';

interface CertificateStackProps extends cdk.StackProps {
  config: EnvironmentConfig;
}

export class CertificateStack extends cdk.Stack {
  public readonly certificate: certificatemanager.ICertificate;

  constructor(scope: Construct, id: string, props: CertificateStackProps) {
    super(scope, id, {
      ...props,
      env: {
        ...props.env,
        region: 'us-east-1', // CloudFront requires certificates in us-east-1
      },
    });

    const { config } = props;

    if (!config.domainName) {
      throw new Error('Domain name is required for certificate stack');
    }
    console.log(config.domainName);
    // SSL Certificate for custom domain
    this.certificate = new certificatemanager.Certificate(this, 'SSLCertificate', {
      domainName: config.domainName,
      validation: certificatemanager.CertificateValidation.fromDns(),
      subjectAlternativeNames: [`*.${config.domainName.split('.').slice(-2).join('.')}`],
    });

    // Output certificate ARN for use in other stacks
    new cdk.CfnOutput(this, 'CertificateArn', {
      value: this.certificate.certificateArn,
      description: 'SSL Certificate ARN for CloudFront',
      exportName: `${config.environment}-certificate-arn`,
    });

    // Note: DNS validation records must be retrieved from AWS Console
    // Go to Certificate Manager in us-east-1 region to get validation CNAME records
  }
}
