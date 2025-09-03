#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { WhaClientStack } from '../lib/wha-client-stack';
import { getEnvironmentConfig } from '../lib/config';

const app = new cdk.App();

// Get environment from context
const environment = app.node.tryGetContext('environment') || 'staging';
const config = getEnvironmentConfig(environment);

new WhaClientStack(app, `WhaClient-${config.environment}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  config,
});
