# SV40K Serien Frontend Infrastructure

This directory contains AWS CDK infrastructure for deploying the React Native Expo web app to AWS.

## Architecture Overview

The infrastructure creates:
- **S3 Bucket**: Hosts the static web app files (private access)
- **CloudFront Distribution**: CDN for global content delivery with Origin Access Control (OAC)
- **SSL Certificate**: Optional SSL certificate via AWS Certificate Manager (us-east-1 only)
- **IAM User**: For CI/CD deployments with minimal permissions

**No Route 53**: DNS is managed externally (Loopia/Websupport)

## Infrastructure Stacks

### 1. Certificate Stack (Optional)
- **Purpose**: Creates SSL certificates for custom domains
- **Region**: Always deploys to `us-east-1` (CloudFront requirement)
- **File**: `bin/certificate.ts` → `lib/certificate-stack.ts`
- **When to use**: Only if you want custom domains with SSL

### 2. Main Stack (WhaClient)
- **Purpose**: Creates S3, CloudFront, and IAM resources
- **Region**: Configurable (default: us-east-1)
- **File**: `bin/infrastructure.ts` → `lib/wha-client-stack.ts`
- **Always required**: Yes

## Environment Configuration

Environments are configured in `lib/config.ts`:

- **Staging**: Uses custom domain `staging-app.valhallarena.se` with SSL
- **Production**: No custom domain configured (uses CloudFront default)

## Prerequisites

1. **AWS CLI**: Configured with appropriate credentials
2. **Node.js**: Version 18+ 
3. **AWS CDK**: Version 2.x
4. **Environment Files**: Set up in root directory (see Local Development)

## Infrastructure Deployment

### Step 1: Install Dependencies
```bash
cd infrastructure
npm install
```

### Step 2: Bootstrap CDK (One-time setup)
```bash
# Bootstrap for your AWS account/region
cdk bootstrap
```

### Step 3: Deploy Certificate Stack (Optional - for custom domains)
```bash
# For staging with custom domain
cdk deploy WhaClient-staging-Certificate --context environment=staging

# For production (skip if no custom domain needed)
cdk deploy WhaClient-prod-Certificate --context environment=prod
```

**After certificate deployment:**
1. Go to AWS Console → Certificate Manager (us-east-1 region)
2. Find your certificate and copy the DNS validation CNAME records
3. Add these CNAME records to your DNS provider (Loopia/Websupport)
4. Wait for validation (can take up to 30 minutes)

### Step 4: Deploy Main Stack
```bash
# Deploy staging
cdk deploy WhaClient-staging --context environment=staging

# Deploy production  
cdk deploy WhaClient-prod --context environment=prod
```

### Step 5: DNS Setup (For custom domains)
After main stack deployment:
1. Get CloudFront domain from stack outputs
2. Add CNAME record in your DNS provider:
   - `staging-app.valhallarena.se` → `[CloudFront Domain]`

## Local Development Setup

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g @expo/cli`
- Git

### Step 1: Clone and Install
```bash
git clone [repository-url]
cd sv40kSerien-frontend-app
npm install
```

### Step 2: Environment Setup
The app uses environment-specific configuration files:

```bash
# Copy development environment (points to localhost)
copy .env.development .env
```

### Step 3: Start Development Server
```bash
# Start Expo development server
npx expo start
```

### Step 4: Choose Platform
After starting, choose your platform:
- **Web**: Press `w` (opens in browser)
- **iOS Simulator**: Press `i` (requires Xcode on Mac)
- **Android Emulator**: Press `a` (requires Android Studio)

### Development Environment Details
When using `.env.development`:
- API URL: `http://localhost:5109`
- Android API URL: `http://10.0.2.2:5109` (Android emulator)
- Environment: `development`

### Troubleshooting Local Development
- **Port conflicts**: Change port in `.env.development`
- **Android emulator**: Ensure Android Studio is installed and emulator is running
- **iOS simulator**: Requires macOS with Xcode

## Manual Deployment Guide

### Prerequisites
- AWS CLI configured
- Infrastructure deployed (see above)
- Node.js and npm installed

### Step 1: Set Environment and Build

**For Staging Deployment:**
```bash
# Navigate to project root
cd sv40kSerien-frontend-app

# Set staging environment
copy .env.staging .env

# Build the web app
npx expo export --platform web --output-dir dist --clear
```

**For Production Deployment:**
```bash
# Set production environment
copy .env.production .env

# Build the web app
npx expo export --platform web --output-dir dist --clear
```

### Step 2: Get Stack Information

**For Staging:**
```bash
aws cloudformation describe-stacks --stack-name WhaClient-staging
```

**For Production:**
```bash
aws cloudformation describe-stacks --stack-name WhaClient-prod
```

Look for these outputs:
- `BucketName`: S3 bucket name
- `DistributionId`: CloudFront distribution ID
- `WebsiteURL`: Your app's URL

### Step 3: Deploy Files

**For Staging:**
```bash
# Upload to S3 (replace with your actual bucket name from stack outputs)
aws s3 sync dist/ s3://wha-client-staging-web-app --delete

# Invalidate CloudFront cache (replace with your actual distribution ID)
aws cloudfront create-invalidation --distribution-id E3BF09I57S5OM3 --paths "/*"
```

**For Production:**
```bash
# Upload to S3 (replace with your actual bucket name from stack outputs)
aws s3 sync dist/ s3://wha-client-prod-web-app --delete

# Invalidate CloudFront cache (replace with your actual distribution ID)
aws cloudfront create-invalidation --distribution-id YOUR_PROD_DISTRIBUTION_ID --paths "/*"
```

### Step 4: Verify Deployment
1. Wait 2-3 minutes for CloudFront invalidation
2. Visit your website URL (from stack outputs)
3. Check browser console for any errors
4. Verify API calls are going to correct environment

### Deployment Checklist
- [ ] Correct environment file copied to `.env`
- [ ] Build completed without errors
- [ ] Files uploaded to correct S3 bucket
- [ ] CloudFront cache invalidated
- [ ] Website loads correctly
- [ ] API endpoints working

## Environment Files Reference

### `.env.development`
```bash
EXPO_PUBLIC_API_URL=http://localhost:5109
EXPO_PUBLIC_API_URL_ANDROID=http://10.0.2.2:5109
EXPO_PUBLIC_CLIENT_ID=2lg4jikgmjccck95t78lf4g3jc
EXPO_PUBLIC_USER_POOL_URL=https://eu-north-1qq0zhyyi5.auth.eu-north-1.amazoncognito.com
EXPO_PUBLIC_ENVIRONMENT=development
```

### `.env.staging`
```bash
EXPO_PUBLIC_API_URL=https://staging-api.valhallarena.se
EXPO_PUBLIC_API_URL_ANDROID=https://staging-api.valhallarena.se
EXPO_PUBLIC_CLIENT_ID=2lg4jikgmjccck95t78lf4g3jc
EXPO_PUBLIC_USER_POOL_URL=https://eu-north-1qq0zhyyi5.auth.eu-north-1.amazoncognito.com
EXPO_PUBLIC_ENVIRONMENT=staging
```

### `.env.production`
```bash
EXPO_PUBLIC_API_URL=https://api.sv40kserien.com
EXPO_PUBLIC_API_URL_ANDROID=https://api.sv40kserien.com
EXPO_PUBLIC_CLIENT_ID=2lg4jikgmjccck95t78lf4g3jc
EXPO_PUBLIC_USER_POOL_URL=https://eu-north-1qq0zhyyi5.auth.eu-north-1.amazoncognito.com
EXPO_PUBLIC_ENVIRONMENT=production
```

## Security Features

- **Origin Access Control**: S3 bucket is not publicly accessible
- **HTTPS Only**: All traffic redirected to HTTPS
- **Modern TLS**: Minimum TLS 1.2
- **HTTP/2 and HTTP/3**: Enabled for performance
- **Compression**: Automatic gzip compression
- **Minimal IAM Permissions**: Deploy user has only necessary permissions

## Cost Optimization

- **CloudFront Caching**: Optimized cache policies
- **S3 Storage**: Standard storage class
- **Certificate Manager**: Free SSL certificates
- **Price Class**: Limited to North America and Europe (PriceClass_100)

## Troubleshooting

### Common Issues

1. **Certificate validation hanging**: Check DNS propagation and ensure CNAME records are correct
2. **Build fails**: Ensure correct environment file is copied to `.env`
3. **CloudFront shows old content**: Wait for invalidation or create new invalidation
4. **403 errors**: Check Origin Access Control configuration
5. **Local dev API errors**: Ensure backend is running on localhost:5109

### Getting Help

1. Check AWS CloudFormation console for stack events
2. Check CloudFront distribution settings
3. Verify S3 bucket permissions
4. Check Certificate Manager for certificate status

## Stack Outputs

After deployment, the stack provides these outputs:
- **BucketName**: S3 bucket name for deployments
- **DistributionId**: CloudFront distribution ID for cache invalidation
- **DistributionDomainName**: CloudFront domain name
- **WebsiteURL**: Complete website URL
- **DeployUserName**: IAM user for CI/CD
- **CertificateArn**: SSL certificate ARN (if using custom domain)
