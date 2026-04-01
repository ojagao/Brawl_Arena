#!/bin/bash
set -euo pipefail

PROFILE="sandbox"
REGION="ap-northeast-1"
SERVICE_NAME="brawl-arena"
CONNECTION_ARN="arn:aws:apprunner:ap-northeast-1:849886573014:connection/generosity/640c015db3f440258d56686ea6a11c1c"
REPO_URL="https://github.com/ojagao/Brawl_Arena"
BRANCH="main"

echo "=== Brawl Arena - App Runner Deploy ==="

# Check if service already exists
EXISTING=$(aws apprunner list-services \
  --profile "$PROFILE" \
  --region "$REGION" \
  --query "ServiceSummaryList[?ServiceName=='${SERVICE_NAME}'].ServiceArn" \
  --output text 2>/dev/null || true)

if [ -n "$EXISTING" ] && [ "$EXISTING" != "None" ]; then
  echo "Service already exists. Triggering redeployment..."
  aws apprunner start-deployment \
    --profile "$PROFILE" \
    --region "$REGION" \
    --service-arn "$EXISTING"
  SERVICE_ARN="$EXISTING"
else
  echo "Creating new App Runner service..."
  SERVICE_ARN=$(aws apprunner create-service \
    --profile "$PROFILE" \
    --region "$REGION" \
    --service-name "$SERVICE_NAME" \
    --source-configuration '{
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
            "Runtime": "NODEJS_18",
            "BuildCommand": "npm install",
            "StartCommand": "npm start",
            "Port": "3000",
            "RuntimeEnvironmentVariables": {
              "NODE_ENV": "production"
            }
          }
        }
      }
    }' \
    --instance-configuration '{
      "Cpu": "0.25 vCPU",
      "Memory": "0.5 GB"
    }' \
    --query 'Service.ServiceArn' \
    --output text)

  echo "Service created: $SERVICE_ARN"
fi

echo ""
echo "Waiting for service to be running..."
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

echo ""
echo "=== Deploy Complete ==="
echo "URL: https://${SERVICE_URL}"
echo ""
echo "Setting PUBLIC_URL environment variable..."

aws apprunner update-service \
  --profile "$PROFILE" \
  --region "$REGION" \
  --service-arn "$SERVICE_ARN" \
  --source-configuration '{
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
          "Runtime": "NODEJS_18",
          "BuildCommand": "npm install",
          "StartCommand": "npm start",
          "Port": "3000",
          "RuntimeEnvironmentVariables": {
            "NODE_ENV": "production",
            "PUBLIC_URL": "https://'"$SERVICE_URL"'"
          }
        }
      }
    }
  }' > /dev/null 2>&1

echo "PUBLIC_URL set to https://${SERVICE_URL}"
echo ""
echo "Display:    https://${SERVICE_URL}"
echo "Controller: https://${SERVICE_URL}/control/<roomId>"
