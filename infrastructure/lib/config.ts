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
        domainName: 'valhallarena.se', 
        certificateArn: 'arn:aws:acm:us-east-1:741448922756:certificate/b164185a-537f-4bb7-bbb5-ac2c4a6dd63a',
        bucketName: 'wha-client-prod-web-app',
        cloudFrontComment: 'WHA Client Production Web App',
      };
    case 'staging':
    default:
      return {
        environment: 'staging',
        domainName: 'staging-app.valhallarena.se',
        certificateArn: 'arn:aws:acm:us-east-1:741448922756:certificate/b164185a-537f-4bb7-bbb5-ac2c4a6dd63a',
        bucketName: 'wha-client-staging-web-app',
        cloudFrontComment: 'WHA Client Staging Web App',
      };
  }
}
