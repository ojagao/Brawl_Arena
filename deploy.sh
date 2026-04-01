#!/bin/bash
set -euo pipefail

PROFILE="sandbox"
REGION="ap-northeast-1"
SERVICE_NAME="brawl-arena"
CONNECTION_ARN="arn:aws:apprunner:ap-northeast-1:849886573014:connection/generosity/640c015db3f440258d56686ea6a11c1c"
REPO_URL="https://github.com/ojagao/Brawl_Arena"
BRANCH="main"

echo "=== Brawl Arena - App Runner Deploy ==="

# Push latest code to GitHub
echo "[1/3] Pushing to GitHub..."
git add -A
git diff --cached --quiet && echo "  No changes to commit." || \
  git commit -m "deploy: update for App Runner"
git push origin main 2>&1 || true

# Create or update App Runner service
echo "[2/3] App Runner service..."
EXISTING=$(aws apprunner list-services \
  --profile "$PROFILE" \
  --region "$REGION" \
  --query "ServiceSummaryList[?ServiceName=='${SERVICE_NAME}'].ServiceArn" \
  --output text 2>/dev/null || true)

SOURCE_CONFIG='{
  "AuthenticationConfiguration": {
    "ConnectionArn": "'"$CONNECTION_ARN"'"
  },
  "AutoDeploymentsEnabled": true,
  "CodeRepository": {
    "RepositoryUrl": "'"$REPO_URL"'",
    "SourceCodeVersion": {
      "Type": "BRANCH",
      "Value": "'"$BRANCH"'"
    },
    "CodeConfiguration": {
      "ConfigurationSource": "API",
      "CodeConfigurationValues": {
        "Runtime": "NODEJS_22",
        "BuildCommand": "npm install",
        "StartCommand": "npm start",
        "Port": "3000",
        "RuntimeEnvironmentVariables": {
          "NODE_ENV": "production"
        }
      }
    }
  }
}'

if [ -n "$EXISTING" ] && [ "$EXISTING" != "None" ]; then
  echo "  Updating existing service..."
  SERVICE_ARN="$EXISTING"
  aws apprunner update-service \
    --profile "$PROFILE" \
    --region "$REGION" \
    --service-arn "$SERVICE_ARN" \
    --source-configuration "$SOURCE_CONFIG" > /dev/null
else
  echo "  Creating new service..."
  SERVICE_ARN=$(aws apprunner create-service \
    --profile "$PROFILE" \
    --region "$REGION" \
    --service-name "$SERVICE_NAME" \
    --source-configuration "$SOURCE_CONFIG" \
    --instance-configuration '{
      "Cpu": "0.25 vCPU",
      "Memory": "0.5 GB"
    }' \
    --query 'Service.ServiceArn' \
    --output text)
fi

echo "  ServiceArn: $SERVICE_ARN"

# Wait for service to be running
echo "[3/3] Waiting for service..."
while true; do
  STATUS=$(aws apprunner describe-service \
    --profile "$PROFILE" \
    --region "$REGION" \
    --service-arn "$SERVICE_ARN" \
    --query 'Service.Status' \
    --output text)

  echo "  Status: $STATUS"

  if [ "$STATUS" = "RUNNING" ]; then
    break
  elif [ "$STATUS" = "CREATE_FAILED" ] || [ "$STATUS" = "DELETE_FAILED" ]; then
    echo "ERROR: Service failed with status: $STATUS"
    exit 1
  fi

  sleep 10
done

SERVICE_URL=$(aws apprunner describe-service \
  --profile "$PROFILE" \
  --region "$REGION" \
  --service-arn "$SERVICE_ARN" \
  --query 'Service.ServiceUrl' \
  --output text)

# Set PUBLIC_URL
aws apprunner update-service \
  --profile "$PROFILE" \
  --region "$REGION" \
  --service-arn "$SERVICE_ARN" \
  --source-configuration "$(echo "$SOURCE_CONFIG" | sed 's/"NODE_ENV": "production"/"NODE_ENV": "production", "PUBLIC_URL": "https:\/\/'"$SERVICE_URL"'"/')" > /dev/null 2>&1 || true

echo ""
echo "=== Deploy Complete ==="
echo "URL: https://${SERVICE_URL}"
echo "Controller: https://${SERVICE_URL}/control/<roomId>"
