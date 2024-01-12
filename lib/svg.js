#!/usr/bin/env zx
import "zx/globals";
import { $ } from "zx";
import { promises as fs } from "fs";
import { getNames } from "./sheets.js";
import { getCodesToPlot } from "./utils.mjs";
process.env.FORCE_COLOR = "1";

const cellSize = 10;
const height = 99;
const width = 210;
const margin = 4;

const allNames = await getNames();
const codesToPlot = await getCodesToPlot();

const generateClues = async (legend, code) => {
  const hori = `hori=[${legend.across
    .map((clue) => `"${clue.clue}"`)
    .join(",")}]`;
  const verti = `verti=[${legend.down
    .map((clue) => `"${clue.clue}"`)
    .join(",")}]`;

  const horiPos = `horiPos=[${legend.across
    .map((clue) => clue.position)
    .join(",")}]`;
  const vertiPos = `vertiPos=[${legend.down
    .map((clue) => clue.position)
    .join(",")}]`;

  const fontsize = 14;

  const margin = 5;
  const gap = 3;

  const numberWidth = 7;
  const colWidth = (width - margin - numberWidth * 2 - gap * 2) / 2; // width for the text wrapping
  const offset = 10;
  const lineheight = 0.4;

  const c1c = numberWidth + gap; //column 1 clue start
  const c2n = numberWidth + gap + colWidth + numberWidth; //column 2 number start
  const c2c = c2n + gap; //column 2 clue start

  const silobale = `silobale=["B","A","S","I","M","L","L","O","T","T","E","N","O"]`;
  const silobaleIndex = `indexes=[0,1,2,8,14,17,19,20,21,22,23,26,29]`;

  console.log("genrating clues for ", code);

  return $`vpype \
  eval "hl=${legend.across.length}" \
  eval "vl=${legend.down.length}" \
  eval ${hori} \
  eval ${verti} \
  eval ${horiPos} \
  eval ${vertiPos} \
  eval ${silobale} \
  eval ${silobaleIndex} \
  eval "fs=${fontsize}" \
  eval "nw=${numberWidth}" \
  eval "cw=${colWidth}" \
  eval "off=${offset}" \
  eval "lh=${lineheight}" \
  eval "c1c=${c1c}" \
  eval "c2n=${c2n}" \
  eval "c2c=${c2c}" \
  eval "width=${width}" \
  eval "height=${height}" \
  eval "code='${code}'" \
  eval "charIndex=0" \
  text -s 18 -p %c1c*mm% 8mm "Dat je in 2024 heel veel kleine gelukjes mag vinden." \
  text -s 16 -p %c1c*mm% 17mm "Horizontaal" \
  text -s 16 -p %c2c*mm% 17mm "Verticaal" \
  begin repeat %hl% \
    eval "y=(off+fs)+(_i*fs*lh)" \
    text -s %fs% -p %nw*mm% %y*mm% -a right "%horiPos[_i]%." \
    text -s %fs% -p %c1c*mm% %y*mm% -w %cw*mm% "%hori[_i]%" \
  end \
  begin repeat %vl% \
    eval "y=(off+fs)+(_i*fs*lh)" \
    text -s %fs% -p %c2n*mm% %y*mm% -a right "%vertiPos[_i]%." \
    text -s %fs% -p %c2c*mm% %y*mm% -w %cw*mm% "%verti[_i]%" \
  end \
  text -s 14 -p %c1c*mm% %height*0.95*mm% "https://oploss.in/g/%code%" \
  grid --offset 3mm 3mm --keep-page-size 6 5 \
    eval "%isChar=_i in indexes%" \
    text --layer 2 -a center -s 10 -p 1mm 1mm "%silobale[charIndex] if isChar else ''%" \
    eval "%if isChar: charIndex+=1 %" \
  end \
  eval "xPos=width-23" \
  eval "yPos=height-18" \
  translate --layer 2 %xPos*mm% %yPos*mm% \
  write --page-size %width*mm%x%height*mm% ./svgs/clues/${code}.svg`;
};

async function generateGrid(
  cellSize,
  width,
  height,
  margin,
  cells,
  numbers,
  code
) {
  const nCols = Math.floor((width - 2 * margin) / cellSize);
  const nRows = Math.floor((height - 2 * margin) / cellSize);

  console.log("genrating grid for ", code);

  return $`vpype \
eval "cell=${cellSize};width=${width};height=${height}" \
eval "nCols=${nCols};nRows=${nRows}" \
eval margin=${margin} \
eval ${cells} \
eval ${numbers} \
eval "counter=1" \
begin grid -o %cell*mm% %cell*mm% %nCols% %nRows% \
  eval "%isCell=_i in cells%" \
  eval "%number=_i in numbers%" \
  eval "%size=10 if isCell else 0%" \
  rect 0 0 %size*mm% %size*mm% \
  text -s 10 -p 1mm 2mm "%counter if number else ''%" \
  eval "%if number: counter+=1 %" \
end \
filter --min-length 0.5mm \
splitall  \
deduplicate \
linemerge  --tolerance 0.1mm \
linesort \
write --page-size %width*mm%x%height*mm% --center ./svgs/grid/${code}.svg`;
}

async function generateSolution(
  cellSize,
  width,
  height,
  margin,
  cells,
  numbers,
  chars,
  code
) {
  const nCols = Math.floor((width - 2 * margin) / cellSize);
  const nRows = Math.floor((height - 2 * margin) / cellSize);

  console.log("genrating solution for ", code);

  return await $`vpype \
eval "cell=${cellSize};width=${width};height=${height}" \
eval "nCols=${nCols};nRows=${nRows}" \
eval ${cells} \
eval ${numbers} \
eval ${chars} \
eval "counter=1" \
eval "charIndex=0" \
begin grid -o %cell*mm% %cell*mm% %nCols% %nRows% \
  eval "%isCell=_i in cells%" \
  eval "%number=_i in numbers%" \
  eval "%size=10 if isCell else 0%" \
  rect 0 0 %size*mm% %size*mm% \
  text -s 10 -p 0.5mm 1.5mm "%counter if number else ''%" \
  text -s 20 -p 5mm 5mm -a center "%chars[charIndex] if isCell else ''%" \
  eval "%if number: counter+=1 %" \
  eval "%if isCell: charIndex+=1 %" \
end \
splitall  \
deduplicate \
linemerge  --tolerance 0.1mm \
write -m none --page-size %width*mm%x%height*mm% --center ./svgs/solution/${code}.svg`;

  //Optional: copy solutions to another project
  // return await $`cp ./svgs/solution/${code}.svg ../oplossin/src/svgs/${code}.svg`;
}

const generateEnvelop = async (code, address) => {
  const vpAddress = `address=[${address.map((line) => `"${line}"`).join(",")}]`;

  console.log("genrating evelope for ", code);

  await $`vpype \
  eval "length=${address.length}" \
  eval ${vpAddress} \
  begin repeat %length% \
    eval "y=60+(_i*8)" \
    text -s 20 -p 12cm %y*mm% "%address[_i]%" \
  end \
  write --page-size 229mmx114mm ./svgs/envelop/${code}.svg`;
};

const generateSVGs = async () => {
  await Promise.all(
    codesToPlot.map(async (code) => {
      try {
        console.log("reading file ", code);
        const data = await fs.readFile(`./crosswords/${code}.json`);

        const { grid, legend } = JSON.parse(data);

        const cells = grid.flat().reduce((acc, cur, i) => {
          if (cur != null) {
            acc.push({ index: i, value: cur.char });
          }
          return acc;
        }, []);

        const numbers = grid.flat().reduce((acc, cur, i) => {
          if (cur != null) {
            if (
              (cur["across"] && cur["across"]["is_start_of_word"]) ||
              (cur["down"] && cur["down"]["is_start_of_word"])
            ) {
              acc.push(i);
            }
          }
          return acc;
        }, []);
        const vpCells = "cells=[" + cells.map((c) => c.index).join(",") + "]";
        const vpChars =
          "chars=[" + cells.map((c) => `"${c.value}"`).join(",") + "]";

        const vpNumbers = "numbers=[" + numbers.join(",") + "]";

        await generateGrid(
          cellSize,
          width,
          height,
          margin,
          vpCells,
          vpNumbers,
          code
        );
        await generateClues(legend, code);
        await generateSolution(
          cellSize,
          width,
          height,
          margin,
          vpCells,
          vpChars,
          vpNumbers,
          code
        );

        const address = allNames
          .find((name) => name[0] === code)
          .slice(9)
          .filter((line) => line !== "");
        await generateEnvelop(code, address);
      } catch (err) {
        console.error(err);
      }
    })
  );
};

export { generateSVGs };
