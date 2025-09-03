# WHA Client Infrastructure

This directory contains AWS CDK infrastructure code for deploying the WHA Client React Native Expo web app to AWS.

## Architecture

The infrastructure creates:
- **S3 Bucket**: Hosts the static web app files
- **CloudFront Distribution**: CDN for global content delivery
- **Route 53**: DNS management for custom domain
- **SSL Certificate**: Automatic SSL certificate via AWS Certificate Manager
- **IAM User**: For CI/CD deployments

## Prerequisites

1. **AWS CLI** configured with appropriate credentials
2. **Node.js** (v18 or later)
3. **AWS CDK** installed globally: `npm install -g aws-cdk`
4. **Custom Domain** (optional but recommended)

## Setup

1. **Install dependencies**:
   ```bash
   cd infrastructure
   npm install
   ```

2. **Configure your domain** (edit `lib/config.ts`):
   ```typescript
   // Update the domain names for your environments
   domainName: 'your-domain.com', // prod
   domainName: 'staging.your-domain.com', // staging
   ```

3. **Bootstrap CDK** (one-time setup):
   ```bash
   cdk bootstrap
   ```

## Deployment Commands

### Staging Environment
```bash
# Preview changes
npm run diff:staging

# Deploy infrastructure
npm run deploy:staging

# Or manually:
cdk deploy --context environment=staging
```

### Production Environment
```bash
# Preview changes
npm run diff:prod

# Deploy infrastructure
npm run deploy:prod

# Or manually:
cdk deploy --context environment=prod
```

## Environment Configuration

The infrastructure supports two environments:

### Staging
- Domain: `staging.your-domain.com`
- S3 Bucket: `wha-client-staging-web-app`
- Auto-delete resources on stack deletion

### Production
- Domain: `your-domain.com`
- S3 Bucket: `wha-client-prod-web-app`
- Resources retained on stack deletion

## Custom Domain Setup

### Option 1: New Domain (CDK manages everything)
1. Update `config.ts` with your domain name
2. Deploy the stack - it will create Route 53 hosted zone and SSL certificate
3. Update your domain registrar's nameservers to point to the Route 53 hosted zone

### Option 2: Existing Route 53 Hosted Zone
1. Uncomment and set `hostedZoneId` and `hostedZoneName` in `config.ts`
2. Deploy the stack - it will use your existing hosted zone

## App Deployment

After infrastructure is deployed, you can deploy your app:

### Build the Web App
```bash
# From the root directory
npx expo export --platform web --output-dir dist --clear
```

### Deploy Using Scripts
```bash
# PowerShell (Windows)
cd infrastructure/scripts
.\deploy.ps1 staging

# Bash (Linux/Mac)
cd infrastructure/scripts
chmod +x deploy.sh
./deploy.sh staging
```

### Manual Deployment
```bash
# Get stack outputs
aws cloudformation describe-stacks --stack-name WhaClient-staging

# Upload to S3
aws s3 sync dist/ s3://wha-client-staging-web-app --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id E3BF09I57S5OM3 --paths "/*"
```

## Stack Outputs

After deployment, the stack provides these outputs:
- **BucketName**: S3 bucket for file uploads
- **DistributionId**: CloudFront distribution ID
- **DistributionDomainName**: CloudFront URL
- **WebsiteURL**: Your custom domain URL (if configured)
- **DeployUserName**: IAM user for CI/CD
- **CertificateArn**: SSL certificate ARN

## CI/CD Integration

The stack creates an IAM user with permissions to:
- Upload files to S3
- Invalidate CloudFront cache

Create access keys for this user and use them in your CI/CD pipeline.

## Security Features

- **Origin Access Control**: S3 bucket is not publicly accessible
- **HTTPS Only**: All traffic redirected to HTTPS
- **Modern TLS**: Minimum TLS 1.2
- **HTTP/2 and HTTP/3**: Enabled for performance
- **Compression**: Automatic gzip compression

## Cost Optimization

- **CloudFront Caching**: Optimized cache policies
- **S3 Storage**: Standard storage class
- **Route 53**: Minimal DNS queries
- **Certificate Manager**: Free SSL certificates

## Troubleshooting

### Common Issues

1. **Domain validation hanging**: Check DNS propagation and ensure you have access to modify DNS records
2. **Certificate creation timeout**: Certificate validation can take up to 30 minutes
3. **CloudFront cache issues**: Remember to invalidate cache after deployments
4. **Permission errors**: Ensure your AWS credentials have sufficient permissions

### Useful Commands

```bash
# Check stack status
aws cloudformation describe-stacks --stack-name WhaClient-staging

# View CloudFormation events
aws cloudformation describe-stack-events --stack-name WhaClient-staging

# Check certificate status
aws acm list-certificates --region us-east-1

# Test CloudFront distribution
curl -I https://your-cloudfront-url.cloudfront.net
```

## Cleanup

To remove all resources:

```bash
# Staging
cdk destroy --context environment=staging

# Production
cdk destroy --context environment=prod
```

**Note**: Production resources are retained by default. You may need to manually delete them if required.
