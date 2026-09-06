# AI Agent Authentication and Rate-Limit Setup

The application signs every agent request with AWS Signature Version 4. Each
Lambda Function URL must use `AWS_IAM`, and each Lambda handler independently
checks that AWS identified an allowlisted Nukleio application principal.

The application also enforces a distributed fixed-window limit of 10 requests
per authenticated user, per AI operation, per 10 minutes. The DynamoDB check
runs before credits are charged. DynamoDB failures fail closed with HTTP 503;
exceeded limits return HTTP 429 with `Retry-After` and rate-limit headers.

Do not deploy the agent-handler changes until the Function URLs use `AWS_IAM`.
The deployment workflows intentionally fail when they detect any other auth
type.

## 1. Choose environment names and AWS resources

The examples assume:

- AWS region: `us-east-2`
- DynamoDB table: `Nukleio-Ai-Rate-Limits`
- development IAM user: `Nukleio-App-Agent-Invoker-Dev`
- production IAM user: `Nukleio-App-Agent-Invoker-Prod`
- development namespace: `development`
- production namespace: `production`

The Lambda names already used by the deployment workflows are:

| Environment | Resume | Cover letter | Headshot |
|---|---|---|---|
| Development | `Nukleio-Resume-Agent-Dev` | `Nukleio-Cover-Letter-Agent-Dev` | `Nukleio-Professional-Headshot-Agent-Dev` |
| Production | `Nukleio-Resume-Agent` | `Nukleio-Cover-Letter-Agent` | `Nukleio-Professional-Headshot-Agent` |

## 2. Create the DynamoDB table

Run these PowerShell commands from an AWS CLI session with permission to manage
DynamoDB. Creating the table again will fail harmlessly if it already exists;
in that case continue with the TTL command.

```powershell
$NukleioAwsRegion = "us-east-2"
$NukleioRateLimitTable = "Nukleio-Ai-Rate-Limits"

aws dynamodb create-table `
  --region $NukleioAwsRegion `
  --table-name $NukleioRateLimitTable `
  --attribute-definitions AttributeName=rate_limit_key,AttributeType=S `
  --key-schema AttributeName=rate_limit_key,KeyType=HASH `
  --billing-mode PAY_PER_REQUEST

aws dynamodb wait table-exists `
  --region $NukleioAwsRegion `
  --table-name $NukleioRateLimitTable

aws dynamodb update-time-to-live `
  --region $NukleioAwsRegion `
  --table-name $NukleioRateLimitTable `
  --time-to-live-specification Enabled=true,AttributeName=expires_at
```

No sort key or secondary indexes are required. DynamoDB TTL cleanup is
asynchronous; correctness does not depend on immediate deletion because each
10-minute window has a unique key.

## 3. Create separate application IAM users

Create one IAM user for development and one for production. Do not reuse the
GitHub deployment user. In AWS Console, open **IAM > Users > Create user** and
create the two users listed above without console access.

Attach an inline policy to each user. Replace `AWS_ACCOUNT_ID` with the value
from:

```powershell
aws sts get-caller-identity --query Account --output text
```

Development policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "InvokeDevelopmentAgentUrls",
      "Effect": "Allow",
      "Action": "lambda:InvokeFunctionUrl",
      "Resource": [
        "arn:aws:lambda:us-east-2:AWS_ACCOUNT_ID:function:Nukleio-Resume-Agent-Dev",
        "arn:aws:lambda:us-east-2:AWS_ACCOUNT_ID:function:Nukleio-Cover-Letter-Agent-Dev",
        "arn:aws:lambda:us-east-2:AWS_ACCOUNT_ID:function:Nukleio-Professional-Headshot-Agent-Dev"
      ],
      "Condition": {
        "StringEquals": {
          "lambda:FunctionUrlAuthType": "AWS_IAM"
        }
      }
    },
    {
      "Sid": "InvokeDevelopmentFunctionsOnlyThroughUrls",
      "Effect": "Allow",
      "Action": "lambda:InvokeFunction",
      "Resource": [
        "arn:aws:lambda:us-east-2:AWS_ACCOUNT_ID:function:Nukleio-Resume-Agent-Dev",
        "arn:aws:lambda:us-east-2:AWS_ACCOUNT_ID:function:Nukleio-Cover-Letter-Agent-Dev",
        "arn:aws:lambda:us-east-2:AWS_ACCOUNT_ID:function:Nukleio-Professional-Headshot-Agent-Dev"
      ],
      "Condition": {
        "Bool": {
          "lambda:InvokedViaFunctionUrl": "true"
        }
      }
    },
    {
      "Sid": "ConsumeDevelopmentAiRateLimits",
      "Effect": "Allow",
      "Action": "dynamodb:TransactWriteItems",
      "Resource": "arn:aws:dynamodb:us-east-2:AWS_ACCOUNT_ID:table/Nukleio-Ai-Rate-Limits",
      "Condition": {
        "ForAllValues:StringLike": {
          "dynamodb:LeadingKeys": ["development:*"]
        }
      }
    }
  ]
}
```

For production, copy the policy and make these replacements:

- remove `-Dev` from all three Lambda function names
- replace `Development` with `Production` in statement IDs
- replace `development:*` with `production:*`

Create one access key for each user under **Security credentials > Access keys >
Create access key > Application running outside AWS**. Save each secret once;
AWS will not display it again. Never place either key in source control.

## 4. Configure the Lambda handlers

For each development Lambda, open **Configuration > Environment variables >
Edit** and add:

```text
NUKLEIO_APP_IAM_PRINCIPAL_ARNS=arn:aws:iam::AWS_ACCOUNT_ID:user/Nukleio-App-Agent-Invoker-Dev
```

For each production Lambda, use:

```text
NUKLEIO_APP_IAM_PRINCIPAL_ARNS=arn:aws:iam::AWS_ACCOUNT_ID:user/Nukleio-App-Agent-Invoker-Prod
```

The value supports a comma-separated allowlist of up to 10 exact IAM ARNs. Only
add a dedicated testing principal to development; do not add it to production.

Switch all six Function URLs to AWS IAM:

```powershell
$NukleioAwsRegion = "us-east-2"
$NukleioFunctions = @(
  "Nukleio-Resume-Agent-Dev",
  "Nukleio-Cover-Letter-Agent-Dev",
  "Nukleio-Professional-Headshot-Agent-Dev",
  "Nukleio-Resume-Agent",
  "Nukleio-Cover-Letter-Agent",
  "Nukleio-Professional-Headshot-Agent"
)

foreach ($NukleioFunction in $NukleioFunctions) {
  aws lambda update-function-url-config `
    --region $NukleioAwsRegion `
    --function-name $NukleioFunction `
    --auth-type AWS_IAM

  aws lambda get-function-url-config `
    --region $NukleioAwsRegion `
    --function-name $NukleioFunction `
    --query "{FunctionUrl:FunctionUrl,AuthType:AuthType}"
}
```

Every result must report `"AuthType": "AWS_IAM"`.

Then inspect **Configuration > Permissions > Resource-based policy** for each
Lambda. Remove legacy statements whose principal is `*` and whose action grants
`lambda:InvokeFunctionUrl` or `lambda:InvokeFunction`. Keep unrelated service
permissions. Same-account invocation is authorized by the application IAM
user's identity policy, so a public function resource policy is unnecessary.

The GitHub deployment identity must additionally have
`lambda:GetFunctionUrlConfig` on all six functions because CI now verifies the
auth type after every deployment.

## 5. Configure Vercel

In **Vercel > Project > Settings > Environment Variables**, configure these as
server-only variables. Use the development IAM user's keys for Development and
Preview; use the production user's keys only for Production.

| Variable | Development/Preview | Production |
|---|---|---|
| `AI_AGENT_AWS_ACCESS_KEY_ID` | development key ID | production key ID |
| `AI_AGENT_AWS_SECRET_ACCESS_KEY` | development secret | production secret |
| `AI_AGENT_AWS_REGION` | `us-east-2` | `us-east-2` |
| `AI_AGENT_RATE_LIMIT_TABLE_NAME` | `Nukleio-Ai-Rate-Limits` | `Nukleio-Ai-Rate-Limits` |
| `AI_AGENT_RATE_LIMIT_NAMESPACE` | `development` | `production` |
| `RESUME_AGENT_BASE_URL` | development Function URL | production Function URL |
| `COVER_LETTER_AGENT_BASE_URL` | development Function URL | production Function URL |
| `PROFESSIONAL_HEADSHOT_AGENT_BASE_URL` | development Function URL | production Function URL |

Do not use a `NEXT_PUBLIC_` prefix. Redeploy after changing environment
variables; an existing deployment does not automatically receive new values.

## 6. Safe rollout order

Complete and verify development before production.

1. Create the DynamoDB table, IAM user, policy, and access key.
2. Add the IAM principal ARN to all three Lambda environments.
3. Add the AWS and rate-limit values to Vercel.
4. Deploy the Nukleio application changes. Signed calls still work against the
   old handler while its Function URL is temporarily `NONE`.
5. Change all three Function URLs for that environment to `AWS_IAM`.
6. Deploy the AI-agent repository changes. CI must report that every URL uses
   `AWS_IAM`.
7. Run the verification below before repeating the process in production.

## 7. Verification

An unsigned request must be rejected by AWS before Lambda runs:

```powershell
Invoke-WebRequest `
  -Method Post `
  -Uri "YOUR_FUNCTION_URL/generate" `
  -ContentType "application/json" `
  -Body '{"userId":"018f74ad-7d38-7c21-9a13-d4fd83325003"}'
```

Expected result: HTTP 403. Confirm in CloudWatch that the Lambda invocation and
paid provider call counts did not increase.

For Postman testing against development:

1. Select **Authorization > AWS Signature**.
2. Enter the development access key and secret.
3. Set AWS Region to `us-east-2` and Service Name to `lambda`.
4. Add `Content-Type: application/json`.
5. Add `x-nukleio-user-id` with the same UUID used in the JSON body.
6. Add the route's operation header:
   `x-nukleio-operation: resume_generate`, `resume_generate_ai`,
   `cover_letter_generate`, `cover_letter_revise`, `headshot_generate`, or
   `headshot_revise`.
7. Add `x-nukleio-request-id` with a new UUID for every request.

Postman calls the agent directly and therefore should use development
credentials and non-production provider limits. End-user rate-limit behavior
must be tested through the Nukleio API/UI, where the eleventh request to the
same operation in one 10-minute window returns HTTP 429 before credit charging
and displays the rate-limit toast.

## 8. Rotation and rollback

Rotate one environment at a time. Create a second IAM access key, update Vercel,
redeploy, verify signed calls, and then deactivate/delete the old key.

Do not roll back a Function URL to `NONE`. If application signing fails, roll
back the application deployment or correct its server-only credentials while
keeping AWS IAM authentication enabled.
