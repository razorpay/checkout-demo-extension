## Workflows

1.  Beta CDN: `beta-cdn.yml` is the workflow used to push the content from `repo/beta-cdn` to stage cdn bucket and content will be served on the cloudfront with

    > bucket-name: **rzp-1018-nonprod-betacdn**
    >
    > path ( in bucket ): checkout/
    >
    > Url : **https://betacdn.np.razorpay.in/checkout/**
    >
    > Pipeline to Run: [link](https://deploy.razorpay.com/#/applications/stage-checkout/executions/configure/c0d0f43b-68bb-45ad-8102-3d02c4a65837)

    **Note**: The workflow auto-invalidated the cache, upon running.

1.  CDN: `cdn.yml` is the workflow used to push the content from `repo/cdn` to production cdn bucket and content will be served on the cloudfront with

    > bucket-name: **checkout-live**
    >
    > path ( in bucket ): checkout/
    >
    > Url : **https://cdn.razorpay.com/**
    >
    > Pipeline to Run: [link](https://deploy.razorpay.com/#/applications/prod-checkout/executions/configure/e8d32db1-c61f-4d1b-a614-06f26ef287a1)

    **Note**: The workflow DO NOT auto-invalidated the cache, upon running, as some files in cdn cache are not actually present in bucket are present due to the cached data. Hence refrain cache invalidation from pipeline and reach-out devops for doing such tasks.

1.  Prod: Build & push to Harbor: `docker-build.yml` runs the tests, generates the files, pushes the content to stage-cdn based on the branch name and pushes the docker image to Harbor Registry ( which will be available for 90 Days )

    > docker image tag for harbor will be

         c.rzp.io/razorpay/checkout:${{ github.sha }}

    > cache control for the branch pushed content ( max-age ): 45Min

1.  Canary Baseline: Build & push to Harbor: `docker-build-for-canary_baseline.yml` runs the tests, generates the files, pushes the content to stage-cdn based, to `branch-name/env-name/` on the branch name and pushes the docker image to Harbor Registry ( which will be available for 90 Days )

    > docker image tag for harbor will be

         c.rzp.io/razorpay/checkout--${{ env.TRAFFIC_ENV }}:${{ github.sha }}

    > cache control for the branch pushed content ( max-age ): 45Min

1.  Comment Test Urls & Preview Builds: `comment-preview-build.yml` comments all the build locations available for testing for both standard and custom checkouts with different APIs and also for SDK testing.

### Stage Bucket Paths

| Details                            | Path                                                           |
| ---------------------------------- | -------------------------------------------------------------- |
| Parent Dir for checkout            | `bucket-name/checkout`                                         |
| Builds of each **commit**          | `bucket-name/checkout/builds/commit-builds/$GITHUB_COMMIT_SHA` |
| Builds of each **branch**          | `bucket-name/checkout/builds/branch-builds/$BRANCH`            |
| Builds of each branch- Traffic Env | `bucket-name/checkout/builds/branch-builds/$BRANCH/`           |
| Builds of each branch-canary       | `bucket-name/checkout/builds/branch-builds/$BRANCH/canary/`    |
| Builds of each branch-baseline     | `bucket-name/checkout/builds/branch-builds/$BRANCH/baseline/`  |
| Content from `repo/beta-cdn/**`    | `bucket-name/checkout/**`                                      |

### Prod Bucket Paths

| Details                    | Path             |
| -------------------------- | ---------------- |
| Content from `repo/cdn/**` | `bucket-name/**` |
