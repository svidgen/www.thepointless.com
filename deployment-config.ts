const mainBranchDomain = process.env.MAIN_BRANCH_DOMAIN;

const mainDomain = mainBranchDomain ? { main: mainBranchDomain } : {};

const config = {
	runtimeNodeVersion: 22,
	domainsByBranch: {
		// Pushes to main deploy the non-indexable preview/staging lane.
		...mainDomain,

		// release/prod deploys the production lane.
		prod: 'www.thepointless.com',

		// Other release/{name} branches deploy to {name}.thepointless.com.
		'*': '{branch}.thepointless.com',
	},
	redirects: [
		// Keep the apex as a durable canonical redirect to production www.
		{ from: 'thepointless.com', to: 'www.thepointless.com', mode: 'permanent' },
	],
	dnsRecordsByBranch: {
		// Main owns shared non-hosting DNS records for the zone.
		main: [
			// Preserve Google Workspace / Gmail delivery from the pre-Route53 zone.
			{
				name: '@',
				zoneDomain: 'thepointless.com',
				type: 'MX',
				values: [
					'10 aspmx.l.google.com.',
					'20 alt1.aspmx.l.google.com.',
					'20 alt2.aspmx.l.google.com.',
					'30 aspmx2.googlemail.com.',
					'30 aspmx3.googlemail.com.',
					'30 aspmx4.googlemail.com.',
					'30 aspmx5.googlemail.com.',
				],
				ttlSeconds: 21600,
			},
			{
				name: '@',
				zoneDomain: 'thepointless.com',
				type: 'TXT',
				values: [
					'"v=spf1 a mx include:_spf.google.com include:servers.mcsv.net -all"',
				],
				ttlSeconds: 3600,
			},

			// Preserve third-party verification/control records from the pre-Route53 zone.
			{
				name: '_domainconnect.thepointless.com',
				type: 'CNAME',
				values: ['_domainconnect.domains.squarespace.com.'],
				ttlSeconds: 14400,
			},
			{
				name: '_7ed6cd91365b4aa2faaf7afa2e15e63a.thepointless.com',
				type: 'CNAME',
				values: [
					'_8de5eca4ee94e3174aa6336d68b9d003.gwpjclltnz.acm-validations.aws.',
				],
				ttlSeconds: 3600,
			},

			// not sure what this is, but it doesn't seem to load anything.
			// {
			// 	name: 'mty3v3o5eumo.thepointless.com',
			// 	type: 'CNAME',
			// 	values: ['gv-xusr7ksf3swkp5.dv.googlehosted.com.'],
			// 	ttlSeconds: 300,
			// },

			// // Preserve explicit legacy subdomain records otherwise shadowed by the wildcard.
			// {
			// 	name: 'beta.thepointless.com',
			// 	type: 'A',
			// 	values: ['192.237.142.130'],
			// 	ttlSeconds: 300,
			// },
			// {
			// 	name: 'dev.thepointless.com',
			// 	type: 'CNAME',
			// 	values: ['d37e7q7aj43e6v.cloudfront.net.'],
			// 	ttlSeconds: 3600,
			// },
			// {
			// 	name: 'aws.thepointless.com',
			// 	type: 'CNAME',
			// 	values: ['d-qy6uayqak4.execute-api.us-east-2.amazonaws.com.'],
			// 	ttlSeconds: 300,
			// },

			// Preserve the legacy wildcard behavior until each subdomain is explicitly migrated.
			// Explicit CDK-managed records should override this wildcard.
			// {
			// 	name: '*.thepointless.com',
			// 	type: 'CNAME',
			// 	values: ['d37e7q7aj43e6v.cloudfront.net.'],
			// 	ttlSeconds: 3600,
			// },
		],
	},
} as const;

export default config;
