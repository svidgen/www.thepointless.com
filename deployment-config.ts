const mainBranchDomain = process.env.MAIN_BRANCH_DOMAIN;

if (!mainBranchDomain) {
  throw new Error('MAIN_BRANCH_DOMAIN is required for deployment config.');
}

const config = {
  runtimeNodeVersion: 22,
  domainsByBranch: {
    // Pushes to main deploy the non-indexable preview/staging lane.
    main: mainBranchDomain,

    // release/prod deploys the production lane.
    prod: 'www.thepointless.com',

    // Other release/{name} branches deploy to {name}.thepointless.com.
    '*': '{branch}.thepointless.com',
  },
  redirects: [
    // Keep the apex as a durable canonical redirect to production www.
    { from: 'thepointless.com', to: 'www.thepointless.com', mode: 'permanent' },
  ],
} as const;

export default config;
