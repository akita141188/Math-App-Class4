import { loadCanonicalGrade4Bank } from './bank-loader';

const canonicalBank = loadCanonicalGrade4Bank();

export const bankManifest = canonicalBank.manifest;
export const questionBank = canonicalBank.questions;
