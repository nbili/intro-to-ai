import { Tiktoken } from 'js-tiktoken';
// o200k_base is GPT-4's tokenizer
import o200k_base from 'js-tiktoken/ranks/o200k_base';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const tokenizer = new Tiktoken(o200k_base);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const text = readFileSync(
  path.resolve(__dirname, 'input.md'),
  'utf-8',
);

const tokens = tokenizer.encode(text);

console.log(
    `Total content: ${text.length}`,
)

console.log(
  `Total tokens: ${tokens.length}`,
);

console.log(tokens.join(', '));

// console.log(tokenizer.decode([3575, 553, 261, 23703, 21277]))
