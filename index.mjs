#!/usr/bin/env zx
import "zx/globals";
import { argv, fs, $ } from "zx";
import { initPlotter, sendCommands } from "./lib/plotter.js";
import { generateCrosswords, getCodesToPlot, plotCode } from "./lib/utils.mjs";
import { generateSVGs } from "./lib/svg.js";
process.env.FORCE_COLOR = "1";

if (argv.penup) {
  const plotter = await initPlotter();
  const commands = ["M03 S0"];
  const result = await sendCommands(plotter, commands);
  console.log(result);
}

if (argv.pendown) {
  const plotter = await initPlotter();
  const commands = ["M03 S100"];
  const result = await sendCommands(plotter, commands);
  console.log(result);
}

if (argv.generate) {
  await generateCrosswords();
  await generateSVGs();
  await $`sh ./lib/gcoder.sh`;
}

if (argv.code && argv.type) {
  await plotCode(argv.code, argv.type);
}

if (argv.conveyor) {
  const codesToPlot = await getCodesToPlot();

  while (codesToPlot.length > 0) {
    const code = codesToPlot.shift();

    await plotCode(code, "grid");
    await plotCode(code, "clues");
    await plotCode(code, "envelop");

    console.log(`--Ready with ${code}--`);
    await fs.appendFile("./plotted.txt", `${code}\n`);
  }
}

process.exit();
