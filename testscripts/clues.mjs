#!/usr/bin/env zx
import "zx/globals";
import { $ } from "zx";
import { getClues } from "../lib/sheets.js";

//# 99x210
const clues = await getClues();

const height = 99;
const width = 210;
const margin = 5;
const gap = 3;
const numberWidth = 7;
const colWidth = (width - margin - numberWidth * 2 - gap * 2) / 2; // width for the text wrapping
const offset = 0;
const lineheight = 0.4;

const fontsize = 14;

const c1c = numberWidth + gap; //column 1 clue start
const c2n = numberWidth + gap + colWidth + numberWidth; //column 2 number start
const c2c = c2n + gap; //column 2 clue start

const r1w = c1c + colWidth; //rectangle 1 width
const rectH = clues.length * lineheight * fontsize; //rectangle 2 height

const vclues = `clues=[${clues.map(([_, clue]) => `"${clue}"`).join(",")}]`;

await $`vpype \
eval "length=${clues.length}" \
eval ${vclues} \
eval "fs=${fontsize}" \
eval "nw=${numberWidth}" \
eval "cw=${colWidth}" \
eval "off=${offset}" \
eval "lh=${lineheight}" \
eval "rh=${rectH}" \
eval "c1c=${c1c}" \
eval "c2n=${c2n}" \
eval "c2c=${c2c}" \
eval "r1w=${r1w}" \
eval "width=${width}" \
eval "height=${height}" \
eval "gap=${gap}" \
begin repeat %length% \
  text -s %fs% -p %nw*mm% %off+fs+_i*fs*lh*mm% -a right "%_i+10%." \
  text -s %fs% -p %c1c*mm% %off+fs+_i*fs*lh*mm% -w %cw*mm% "%clues[_i]%" \
end \
begin repeat %length% \
  text -s %fs% -p %c2n*mm% %off+fs+_i*fs*lh*mm% -a right "%_i+10%." \
  text -s %fs% -p %c2c*mm% %off+fs+_i*fs*lh*mm% -w %cw*mm% "%clues[length-_i-1]%" \
end \
rect 0 0 %r1w*mm% %rh*mm% \
rect 0 0 %width*mm% %height*mm% \
write cluestest.svg`;

console.log("Colwidth", colWidth);
console.log("rectw", margin + numberWidth + colWidth);
