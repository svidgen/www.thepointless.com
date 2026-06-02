import { withContext } from 'wirejs-resources';

export const exampleApi = withContext(c => ({
	hello: (name: string) => `Hello, ${name}.`
}));