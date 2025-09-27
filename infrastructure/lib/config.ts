export interface EnvironmentConfig {
  environment: string;
  domainName?: string; 
  certificateArn?: string;
  hostedZoneId?: string;
  hostedZoneName?: string;
  bucketName: string;
  cloudFrontComment: string;
}

export function getEnvironmentConfig(environment: string): EnvironmentConfig {
  switch (environment) {
    case 'prod':
      return {
        environment: 'prod',
        // domainName: 'app.valhallarena.se', 
        bucketName: 'wha-client-prod-web-app',
        cloudFrontComment: 'WHA Client Production Web App',
        // hostedZoneId: 'Z1234567890ABC', 
        // hostedZoneName: 'wha-client.com', 
      };
    case 'staging':
    default:
      return {
        environment: 'staging',
        domainName: 'staging-app.valhallarena.se',
        certificateArn: 'arn:aws:acm:us-east-1:741448922756:certificate/5aa6b8cc-5d61-4a02-853e-4686b6ad08f9',
        bucketName: 'wha-client-staging-web-app',
        cloudFrontComment: 'WHA Client Staging Web App',
        // hostedZoneId: 'Z1234567890ABC', 
        // hostedZoneName: 'wha-client.com', 
      };
  }
}
