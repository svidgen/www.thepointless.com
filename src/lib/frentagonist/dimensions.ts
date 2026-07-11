export const PROFILE_VERSION = 1;
export const STORAGE_KEY = 'frentagonist.profile.v1';

export const dimensions = {
	'Name': 'string',
	'Your Political Leaning': ['Leftist', 'Progressive', 'Mixed', 'Conservative', 'Alt-Right'],
	'Your Ideal State Structure': ['Anarchist', 'Libertarian', 'Mixed', 'Socialist', 'Totalitarian'],
	'Your Religiousness': ['Atheistic', 'Agnostic', 'Casual', 'Devout', 'Fundamentalist'],
	'Academic Style': ['Liberal Arts', 'Theoretical Science', 'Youtube+Wikipedia', 'Applied Science', 'Trade School'],
	'Alcohol': ['Water', 'Wine', 'Scotch', 'Beer', 'Vodka'],
	'Socialization Style': ['Super Introvert', 'Introvert', 'Ambivert', 'Extrovert', 'Super Extrovert'],
	'Preferred Discussion': ['Pretty Clouds', 'Weather', 'News/Gossip', 'Hobbies', 'Politics and Religion'],
} as const;

export type DimensionName = keyof typeof dimensions;
export type Profile = Record<DimensionName, string>;
