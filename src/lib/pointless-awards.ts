import awards from './pointless-awards.json';

export const POINTLESS_AWARD_NAME = 'The Pointless Dot-Com’s Award';
export const POINTLESS_AWARD_DISTINCTION = 'Meritorious Attainment of the Awarded Distinction';
export const POINTLESS_AWARD_CERTIFICATE_TITLE = `Award for ${POINTLESS_AWARD_DISTINCTION}`;
export const POINTLESS_AWARD_FULL_NAME = `${POINTLESS_AWARD_NAME} for ${POINTLESS_AWARD_DISTINCTION}`;

export type PointlessAward = {
	certificateNumber: string;
	recipient: string;
	awardName: string;
	quote: string;
};

export const pointlessAwards = (awards as PointlessAward[]).map(award => ({
	...award,
	awardName: POINTLESS_AWARD_FULL_NAME,
}));

export function getPointlessAward(certificateNumber: string) {
	return pointlessAwards.find(award => award.certificateNumber.toLowerCase() === certificateNumber.toLowerCase());
}
