import awards from './pointless-awards.json';

export type PointlessAward = {
	certificateNumber: string;
	recipient: string;
	awardName: string;
	quote: string;
};

export const pointlessAwards = awards as PointlessAward[];

export function getPointlessAward(certificateNumber: string) {
	return pointlessAwards.find(award => award.certificateNumber.toLowerCase() === certificateNumber.toLowerCase());
}
