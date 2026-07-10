# CDK Deployment Guide

This project is configured for deployment via [AWS CDK](https://aws.amazon.com/cdk/) using GitHub Actions.

## Default Deployment Model

The generated workflows implement a three-lane model:

- `main` push deploys the **staging** stack (`BRANCH_ID=main`)
- `release/{subdomain}` push deploys a **branch release** stack (`BRANCH_ID={subdomain}`)
- Manual workflow **Promote Main To Production Branch** fast-forwards `release/prod` to `main`
- `release/prod` push deploys **production** (`BRANCH_ID=prod`)

This gives you a sustainable promotion path without deploying everything directly from `main`.

## Prerequisites

1. An AWS account
2. A GitHub repository for your app
3. AWS credentials configured in your GitHub repository secrets

## Setting Up AWS Credentials

The recommended approach is to use **OpenID Connect (OIDC)** to allow GitHub Actions to authenticate with AWS without long-lived credentials.

### CLI-Assisted Setup (recommended)

If you have the AWS CLI configured locally, you can run:

```bash
npx wirejs-deploy-cdk github
```

This guided flow can create or update the IAM OIDC provider + deploy role and optionally set GitHub Actions secrets (`AWS_ROLE_ARN`, `AWS_REGION`) using `gh`.

For a combined flow that also offers domain setup, use:

```bash
npx wirejs-deploy-cdk setup
```

### Step 1: Create an IAM OIDC Identity Provider

In the AWS IAM console:
1. Go to **Identity providers** → **Add provider**
2. Select **OpenID Connect**
3. Provider URL: `https://token.actions.githubusercontent.com`
4. Audience: `sts.amazonaws.com`
5. Click **Add provider**

### Step 2: Create an IAM Role

1. Go to **Roles** → **Create role**
2. Select **Web identity** as the trusted entity type
3. Select the GitHub OIDC provider and audience created above
4. Add conditions that allow only your repository and expected branches:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": [
            "repo:YOUR_ORG/YOUR_REPO:ref:refs/heads/main",
            "repo:YOUR_ORG/YOUR_REPO:ref:refs/heads/release/*"
          ]
        }
      }
    }
  ]
}
```

If you later move to GitHub Environments for stricter controls, use the environment subject format (`repo:ORG/REPO:environment:ENV_NAME`) for each lane.

5. Attach the required policies (see below)
6. Name the role (e.g., `GitHubActionsDeployRole`)

### Step 3: Required IAM Permissions

Your IAM role needs the following permissions to deploy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudformation:*",
        "lambda:*",
        "apigateway:*",
        "s3:*",
        "dynamodb:*",
        "cognito-idp:*",
        "cloudfront:*",
        "iam:*",
        "events:*",
        "appsync:*",
        "acm:*",
        "route53:*",
        "sts:AssumeRole",
        "ssm:GetParameter"
      ],
      "Resource": "*"
    }
  ]
}
```

> **Note:** For production, scope these permissions down to only what your app needs.

### Step 4: Add GitHub Secrets

In your GitHub repository:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add the following secrets:
   - `AWS_ROLE_ARN`: The ARN of the IAM role you created (e.g., `arn:aws:iam::123456789012:role/GitHubActionsDeployRole`)
   - `AWS_REGION`: Your AWS region (e.g., `us-east-1`) — optional, defaults to `us-east-1`

## Custom Domain Names

If you do not set a domain in `deployment-config.ts`, deployments still work and are served by generated CloudFront URLs.

To use custom domains, configure `deployment-config.ts`.

Before your first custom-domain deploy, run the domain setup command to create/verify the Route53 hosted zone and nameserver configuration:

```bash
npx wirejs-deploy-cdk domain
```

### Basic Domain (single lane)

```typescript
import { DeploymentConfig } from 'wirejs-resources';

const config: DeploymentConfig = {
  domainsByBranch: {
    main: 'app.example.com',
  },
};

export default config;
```

### Branch/Release Domain Mapping (recommended)

For the default workflow model (`main` => `main`, `release/{subdomain}` => `{subdomain}`, `release/prod` => `prod`):

```typescript
import { DeploymentConfig } from 'wirejs-resources';

const config: DeploymentConfig = {
  domainsByBranch: {
    main: 'staging.example.com',
    prod: 'www.example.com',
    '*': '{branch}.example.com',
  },
};

export default config;
```

With this configuration:

- `main` deploys to `staging.example.com`
- `release/prod` deploys to `www.example.com`
- `release/foo` deploys to `foo.example.com`

### Redirects

You can define host redirects that apply whenever their target domain is deployed:

```typescript
import { DeploymentConfig } from 'wirejs-resources';

const config: DeploymentConfig = {
  domainsByBranch: {
    main: 'staging.example.com',
    prod: 'www.example.com',
    '*': '{branch}.example.com',
  },
  redirects: [
    // Permanent redirect from apex to www
    { from: 'example.com', to: 'www.example.com', mode: 'permanent' },
    // Temporary redirects for renamed subdomains
    { from: 'help.example.com', to: 'support.example.com' },
    // Branch-templated redirects
    { from: '{branch}.old.example.com', to: '{branch}.new.example.com' },
  ],
};

export default config;
```

Redirect behavior:

- Redirects are host-based and preserve path + query
- `mode: 'temporary'` (default) uses HTTP 307 — safe when destinations may change
- `mode: 'permanent'` uses HTTP 308 — for durable canonical redirects (SEO-friendly)
- Redirect source hosts are automatically included in CDK aliases and certificates
- Both `from` and `to` fields support `{branch}` token substitution
- Redirects activate whenever their target domain is deployed (works across all branches)

### Arbitrary DNS Records

You can also create additional Route53 records directly from `deployment-config.ts`.
This is useful when migrating an existing zone (for example from Squarespace) into CDK-managed DNS.

```typescript
import { DeploymentConfig } from 'wirejs-resources';

const config: DeploymentConfig = {
  domainsByBranch: {
    main: 'www.example.com',
    '*': '{branch}.example.com',
  },
  dnsRecordsByBranch: {
    // Global records: choose one explicit owner branch
    main: [
      { name: '@', zoneDomain: 'example.com', type: 'MX', values: ['1 aspmx.l.google.com.'] },
      { name: '@', zoneDomain: 'example.com', type: 'TXT', values: ['"v=spf1 include:_spf.google.com ~all"'] },
      { name: '_dmarc', zoneDomain: 'example.com', type: 'TXT', values: ['"v=DMARC1; p=none"'] },
    ],
    // Branch records: wildcard entries often include {branch} to prevent collisions
    '*': [
      { name: '_verify.{branch}', zoneDomain: 'example.com', type: 'TXT', values: ['"ok-{branch}"'] },
      { name: '{branch}.example.com', type: 'CNAME', values: ['preview-origin.example.net.'] },
    ],
  },
};

export default config;
```

DNS record behavior:

- Supported record types: `A`, `AAAA`, `CAA`, `CNAME`, `MX`, `NS`, `PTR`, `SPF`, `SRV`, `TXT`
- `values` are passed directly to Route53 resource records
- Default TTL is 300 seconds (`ttlSeconds` overrides)
- FQDN record names auto-resolve their hosted zone
- Relative names (`@`, `www`, `_acme-challenge`) require `zoneDomain`
- `{branch}` token substitution works in `name`, `zoneDomain`, and every entry in `values`
- `dnsRecordsByBranch` uses the same key resolution order as `domainsByBranch`: exact branch, then `*`
- For `*` entries, including `{branch}` in `name`, `zoneDomain`, or `values` is recommended for preview-lane isolation
- Manage non-branch global records (for example MX/SPF/apex TXT) from one explicit owner branch (commonly `main` or `prod`)
- Do not define `A`/`AAAA` records in `dnsRecordsByBranch` for hostnames already managed by `domainsByBranch`

**Requirements for custom domains:**
- A Route53 hosted zone must exist for the root domain
- Run `npx wirejs-deploy-cdk domain` to bootstrap hosted zone and registrar/nameserver configuration
- The ACM certificate will be created and validated automatically via DNS
- DNS propagation may take a few minutes after first deployment

### Branch-Based Domains

You can fully customize branch/subdomain mapping in `deployment-config.ts`:

```typescript
import { DeploymentConfig } from 'wirejs-resources';

const config: DeploymentConfig = {
  domainsByBranch: {
    main: 'staging.example.com',
    prod: 'www.example.com',
    qa: 'qa.example.com',
    '*': '{branch}.example.com',
  },
  redirects: [
    // These redirect rules apply whenever their target domain is served
    { from: 'example.com', to: 'www.example.com', mode: 'permanent' },
    { from: 'help.example.com', to: 'support.example.com' },
  ],
};

export default config;
```

Domain resolution order for CDK deployments:
1. exact branch key (e.g. `main`)
2. `*`

There is no fallback to global `domainNames` or `dnsRecords`.

Wildcard template behavior:
- Any `{branch}` token in domain values is replaced with a branch slug.
- Example: `BRANCH_ID=checkout` and `"*": "{branch}.example.com"` resolves to `checkout.example.com`.
- Using `{branch}` in `domainsByBranch['*']` values is recommended to avoid overlap between preview lanes.
- If you intentionally want a shared domain (for example `*.example.com`), keep ownership explicit so only one deployment lane manages it.

Redirect behavior:

- Redirects apply whenever their **target** domain is deployed — they are not branch-scoped.
- Any `{branch}` token in `from` or `to` is replaced with the branch slug.
- Example: `{ from: '{branch}.old.example.com', to: '{branch}.new.example.com' }` and `BRANCH_ID=checkout`
  resolves to `checkout.old.example.com -> checkout.new.example.com`.

### Wildcard Domains & Multi-Tenancy

You can use wildcard domains to serve multiple tenants from a single deployment. This is useful for SaaS applications where subdomains identify tenant accounts.

```typescript
import { DeploymentConfig } from 'wirejs-resources';

const config: DeploymentConfig = {
  domainsByBranch: {
    main: '*.staging.example.com',    // Staging: tenant1.staging.example.com, tenant2.staging.example.com, etc.
    prod: '*.my.example.com',         // Production: acme.my.example.com, widget-corp.my.example.com, etc.
    '*': '*.{branch}.example.com',    // Feature branches: *.dev.example.com, *.feature-x.example.com, etc.
  },
};

export default config;
```

How it works:

1. **CloudFront distribution** is created with the wildcard domain (`*.staging.example.com`) as an alias and certificate SAN
2. **Route53 hosted zone** must exist for the root domain (`staging.example.com`, `my.example.com`, or `example.com`)
3. **A wildcard DNS record** (`*.staging.example.com` or `*.my.example.com`) is created that aliases to the CloudFront distribution
4. **Browser requests** to any subdomain (e.g., `acme.my.example.com`) are routed to CloudFront, then to your app
5. **Your application** reads the `Host` header or domain from the request to identify the tenant and serve appropriate content

Multi-tenant routing example:

```typescript
// In your application, read the x-original-host header set by CloudFront Function
// This header preserves the original host that the client requested
const hostname = request.headers.get('x-original-host'); // e.g., "acme.my.example.com"
const tenant = hostname.split('.')[0];                    // e.g., "acme"

// Load tenant-specific configuration, database, or UI
const tenantConfig = await loadTenantConfig(tenant);
```

You can combine wildcard domains with `{branch}` templating for branch-specific tenant subdomains:

```typescript
const config: DeploymentConfig = {
  domainsByBranch: {
    main: '*.staging.example.com',
    prod: '*.my.example.com',
    '*': '*.{branch}.example.com',  // release/qa → *.qa.example.com, release/v1 → *.v1.example.com
  },
};
```

## Stack Naming

Deploy workflows pass `STACK_NAME` and `BRANCH_ID` explicitly.

- Stack names are derived from `{repo}-{branchId}`
- Non-alphanumeric characters are normalized
- Stack names are capped at 128 chars

The deploy runtime also sanitizes `STACK_NAME` defensively, so branch names like `release/my-feature` cannot create invalid CloudFormation names.

## Accessing Deployment Information at Runtime

Your wirejs app can read deployment information at runtime via `Context.systemInfo`:

```typescript
import { withContext, Context } from 'wirejs-resources';

export const getDeploymentInfo = withContext(async (context: Context) => {
  const attrs = await context.systemInfo();
  return attrs.find(a => a.name.includes('hosting-url'))?.value;
});
```

## Cleaning Up

To destroy the deployed stack:

```bash
APP_ID=your-app BRANCH_ID=main npx wirejs-deploy-cdk destroy
```

Or set `STACK_NAME` directly:

```bash
STACK_NAME=your-app-main npx wirejs-deploy-cdk destroy
```

You can also destroy a release lane directly:

```bash
BRANCH_ID=checkout STACK_NAME=your-app-checkout npx wirejs-deploy-cdk destroy
```
