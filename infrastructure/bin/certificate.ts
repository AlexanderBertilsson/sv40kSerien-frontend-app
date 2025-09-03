#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CertificateStack } from '../lib/certificate-stack';
import { getEnvironmentConfig } from '../lib/config';

const app = new cdk.App();

// Get environment from context
const environment = app.node.tryGetContext('environment') || 'staging';
const config = getEnvironmentConfig(environment);

// Certificate stack - deploys to us-east-1
new CertificateStack(app, `WhaClient-${environment}-Certificate`, {
  config,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1', // Always us-east-1 for CloudFront certificates
  },
});
