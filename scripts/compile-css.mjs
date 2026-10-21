import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import tailwindPostcss from '@tailwindcss/postcss';

const inputPath = path.resolve('src/app/input.css');
const outputPath = path.resolve('src/app/globals.css');

const inputCss = fs.readFileSync(inputPath, 'utf8');

console.log('Compiling Tailwind CSS v4...');
const result = await postcss([tailwindPostcss()]).process(inputCss, {
  from: inputPath,
  to: outputPath,
});

fs.writeFileSync(outputPath, result.css);
console.log(`Success! Compiled globals.css (${(result.css.length / 1024).toFixed(1)} KB)`);
