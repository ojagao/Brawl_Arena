#!/bin/bash
set -euo pipefail

PROFILE="sandbox"
REGION="ap-northeast-1"
SERVICE_NAME="brawl-arena"

echo "=== Brawl Arena - App Runner Remove ==="

SERVICE_ARN=$(aws apprunner list-services \
  --profile "$PROFILE" \
  --region "$REGION" \
  --query "ServiceSummaryList[?ServiceName=='${SERVICE_NAME}'].ServiceArn" \
  --output text 2>/dev/null || true)

if [ -z "$SERVICE_ARN" ] || [ "$SERVICE_ARN" = "None" ]; then
  echo "Service '${SERVICE_NAME}' not found. Nothing to remove."
  exit 0
fi

echo "Found service: $SERVICE_ARN"
echo "Deleting..."

aws apprunner delete-service \
  --profile "$PROFILE" \
  --region "$REGION" \
  --service-arn "$SERVICE_ARN"

echo ""
echo "Waiting for deletion..."
while true; do
  STATUS=$(aws apprunner describe-service \
    --profile "$PROFILE" \
    --region "$REGION" \
    --service-arn "$SERVICE_ARN" \
    --query 'Service.Status' \
    --output text 2>/dev/null || echo "DELETED")

  echo "  Status: $STATUS"

  if [ "$STATUS" = "DELETED" ]; then
    break
  elif [ "$STATUS" = "DELETE_FAILED" ]; then
    echo "ERROR: Deletion failed."
    exit 1
  fi

  sleep 10
done

echo ""
echo "=== Remove Complete ==="
