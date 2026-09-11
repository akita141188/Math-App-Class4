import { createHash } from 'node:crypto';

export type GeneratorParam = string | number | boolean;

export function gcd(a: number, b: number): number {
  let left = Math.abs(a);
  let right = Math.abs(b);
  while (right !== 0) [left, right] = [right, left % right];
  return left || 1;
}

export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

export function reduceFraction(numerator: number, denominator: number) {
  const factor = gcd(numerator, denominator);
  return { numerator: numerator / factor, denominator: denominator / factor };
}

export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

export function stableHash(value: unknown, length = 24): string {
  return createHash('sha256').update(stableStringify(value), 'utf8').digest('hex').slice(0, length);
}

export function formatVi(value: number): string {
  return value.toLocaleString('vi-VN');
}

const digitWords = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

function readThreeDigits(value: number, forceHundreds: boolean): string {
  const hundreds = Math.floor(value / 100);
  const tens = Math.floor((value % 100) / 10);
  const units = value % 10;
  const words: string[] = [];
  if (hundreds > 0 || forceHundreds) words.push(`${digitWords[hundreds]} trăm`);
  if (tens > 1) words.push(`${digitWords[tens]} mươi`);
  else if (tens === 1) words.push('mười');
  else if (units > 0 && (hundreds > 0 || forceHundreds)) words.push('linh');
  if (units > 0) {
    if (units === 1 && tens > 1) words.push('mốt');
    else if (units === 5 && tens > 0) words.push('lăm');
    else words.push(digitWords[units] ?? '');
  }
  return words.join(' ');
}

export function readNaturalNumber(value: number): string {
  if (!Number.isInteger(value) || value < 0 || value > 999_999_999)
    throw new Error(`Unsupported natural number: ${value}`);
  if (value === 0) return 'không';
  const millions = Math.floor(value / 1_000_000);
  const thousands = Math.floor((value % 1_000_000) / 1_000);
  const units = value % 1_000;
  const parts: string[] = [];
  if (millions > 0) parts.push(`${readThreeDigits(millions, false)} triệu`);
  if (thousands > 0)
    parts.push(`${readThreeDigits(thousands, millions > 0 && thousands < 100)} nghìn`);
  if (units > 0) parts.push(readThreeDigits(units, (millions > 0 || thousands > 0) && units < 100));
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

export function seededRandom(seed: string): () => number {
  let state = Number.parseInt(stableHash(seed, 8), 16) >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

export function fisherYates<T>(values: readonly T[], rng: () => number): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex]!, result[index]!];
  }
  return result;
}
