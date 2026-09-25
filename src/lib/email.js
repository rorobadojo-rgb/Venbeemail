// Playful, readable disposable usernames.
import { pick } from './prefs.js';

const MOOD = [
  'ngantuk',
  'mager',
  'gabut',
  'santuy',
  'receh',
  'kepo',
  'baper',
  'bokek',
  'galau',
  'kalem',
  'nekat',
  'lemot',
  'woles',
  'cuek',
  'sultan',
  'bucin',
];
const THING = [
  'burung',
  'bebek',
  'cilok',
  'seblak',
  'tahu',
  'kucing',
  'cendol',
  'bakso',
  'tempe',
  'lele',
  'kerupuk',
  'pisang',
  'kodok',
  'cumi',
  'onde',
  'martabak',
];

export const DOMAINS = ['peler.com', 'ewe.com', 'bawok.com', 'vevek.com', 'pentil.com'];

export function makeUser() {
  const n = Math.floor(10 + Math.random() * 990);
  const sep = Math.random() < 0.7 ? '.' : '_';
  return `${pick(MOOD)}${sep}${pick(THING)}${n}`;
}
