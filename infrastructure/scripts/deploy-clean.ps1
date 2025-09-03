# Deployment script for WHA Client Web App (PowerShell)
# Usage: .\deploy-clean.ps1 [staging|prod]

param(
    [Parameter(Position=0)]
    [ValidateSet("staging", "prod")]
    [string]$Environment = "staging"
)

$ErrorActionPreference = "Stop"

$BuildDir = "../dist"

Write-Host "🚀 Deploying to $Environment environment..." -ForegroundColor Green

# Check if build directory exists
if (-not (Test-Path $BuildDir)) {
    Write-Host "❌ Error: Build directory '$BuildDir' not found" -ForegroundColor Red
    Write-Host "Please run 'npx expo export --platform web --output-dir dist' from the root directory first" -ForegroundColor Yellow
    exit 1
}

# Get stack outputs
Write-Host "📋 Getting stack information..." -ForegroundColor Blue
$StackName = "WhaClient-$Environment"

try {
    $BucketName = (aws cloudformation describe-stacks --stack-name $StackName --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" --output text)
    $DistributionId = (aws cloudformation describe-stacks --stack-name $StackName --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" --output text)
    
    if ([string]::IsNullOrEmpty($BucketName) -or [string]::IsNullOrEmpty($DistributionId)) {
        throw "Could not retrieve stack outputs"
    }
    
    Write-Host "📦 Bucket: $BucketName" -ForegroundColor Cyan
    Write-Host "🌐 Distribution: $DistributionId" -ForegroundColor Cyan
    
    # Sync files to S3
    Write-Host "📤 Uploading files to S3..." -ForegroundColor Blue
    aws s3 sync $BuildDir s3://$BucketName --delete --cache-control "public, max-age=31536000" --exclude "*.html"
    aws s3 sync $BuildDir s3://$BucketName --delete --cache-control "public, max-age=0, must-revalidate" --include "*.html"
    
    # Invalidate CloudFront cache
    Write-Host "🔄 Invalidating CloudFront cache..." -ForegroundColor Blue
    $InvalidationId = (aws cloudfront create-invalidation --distribution-id $DistributionId --paths "/*" --query "Invalidation.Id" --output text)
    Write-Host "⏳ Invalidation ID: $InvalidationId" -ForegroundColor Yellow
    
    Write-Host "✅ Deployment complete!" -ForegroundColor Green
    Write-Host "🌍 Your app will be available shortly at the CloudFront URL" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error: Could not retrieve stack outputs. Make sure the CDK stack is deployed." -ForegroundColor Red
    Write-Host "Error details:" $_.Exception.Message -ForegroundColor Red
    exit 1
}
