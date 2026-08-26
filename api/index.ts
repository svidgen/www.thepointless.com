import {
	AdminService,
	AuthenticationService,
	GoogleOIDCProvider,
	withContext,
} from 'wirejs-resources';

const authService = new AuthenticationService('app', 'auth', {
	oidcProviders: [ GoogleOIDCProvider ]
});

export const auth = authService.buildApi();

new AdminService('app', 'admin', {
	path: '/admin',
	async isAdmin() {
		const user = await auth.getCurrentUser();
		if (!user) return false;
		return ['jon@thepointless.com', 'admin'].includes(user.username);
	}
});

export const exampleApi = withContext(c => ({
	hello: (name: string) => `Hello, ${name}.`
}));