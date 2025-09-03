#!/bin/bash

# Deployment script for WHA Client Web App
# Usage: ./deploy.sh [staging|prod]

set -e

ENVIRONMENT=${1:-staging}
BUILD_DIR="../dist"

echo "🚀 Deploying to $ENVIRONMENT environment..."

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "prod" ]]; then
    echo "❌ Error: Environment must be 'staging' or 'prod'"
    exit 1
fi

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Error: Build directory '$BUILD_DIR' not found"
    echo "Please run 'npm run build:web' from the root directory first"
    exit 1
fi

# Get stack outputs
echo "📋 Getting stack information..."
STACK_NAME="WhaClient-$ENVIRONMENT"
BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" --output text)
DISTRIBUTION_ID=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" --output text)

if [ -z "$BUCKET_NAME" ] || [ -z "$DISTRIBUTION_ID" ]; then
    echo "❌ Error: Could not retrieve stack outputs. Make sure the CDK stack is deployed."
    exit 1
fi

echo "📦 Bucket: $BUCKET_NAME"
echo "🌐 Distribution: $DISTRIBUTION_ID"

# Sync files to S3
echo "📤 Uploading files to S3..."
aws s3 sync $BUILD_DIR s3://$BUCKET_NAME --delete --cache-control "public, max-age=31536000" --exclude "*.html"
aws s3 sync $BUILD_DIR s3://$BUCKET_NAME --delete --cache-control "public, max-age=0, must-revalidate" --include "*.html"

# Invalidate CloudFront cache
echo "🔄 Invalidating CloudFront cache..."
INVALIDATION_ID=$(aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*" --query "Invalidation.Id" --output text)
echo "⏳ Invalidation ID: $INVALIDATION_ID"

echo "✅ Deployment complete!"
echo "🌍 Your app will be available shortly at the CloudFront URL"
