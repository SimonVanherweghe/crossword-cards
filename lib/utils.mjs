import { fs, sleep, question } from "zx";
import { Crossword } from "./crossword.js";
import { getClues, getNames } from "./sheets.js";
import { closePlotter, initPlotter, sendCommands } from "./plotter.js";

const getCodesToPlot = async () => {
  const families = await getNames();
  const codes = families.map((family) => family[0]);

  const plotted = await fs.readFile("./plotted.txt", {
    encoding: "utf8",
    flag: "r",
  });

  const codesToPlot = codes.filter((code) => !plotted.includes(code));
  return codesToPlot;
};

const plotCode = async (code, type) => {
  await question(
    `Press a key to start plotting ${type.toUpperCase()} for ${code}`
  );

  const plotter = await initPlotter();
  const contents = await fs.readFile(`./gcode/${type}/${code}.gcode`, {
    encoding: "utf8",
    flag: "r",
  });
  const commands = contents.split("\n");

  await sendCommands(plotter, commands);
  await sleep(5000);
  await closePlotter(plotter);
};

const generateCrosswords = async () => {
  const clues = await getClues();
  const families = await getNames();

  const files = await fs.readdir("./crosswords");
  const generatedCrosswordCodes = files.map((file) => file.split(".")[0]);

  const crosswordsToGenerate = families.filter(
    (fam) => !generatedCrosswordCodes.includes(fam[0])
  );

  for (let family of crosswordsToGenerate) {
    const code = family[0];
    const names = family
      .slice(2, 9)
      .filter((n) => n !== "")
      .map((name) => name.toUpperCase());
    const wordsIn = clues.map((clue) => clue[0].toUpperCase());
    const cluesIn = clues.map((clue) => clue[1]);

    wordsIn.push(...names);
    cluesIn.push(...names.map(() => "Jezelf, namaste"));

    let version = 0;
    let bestScore = 0;
    let attempt = 0;
    const looser = 250;
    let bestGrid;
    let bestLegend;
    let areaTreshold = 20;
    const tries = 500;
    console.log("Starting with: ", code, " ", names.join("-"));
    do {
      const crossword = new Crossword(wordsIn, cluesIn, 20, 9);
      const grid = crossword.getGrid(50);

      let good = false;
      if (grid == null) {
        const bad_words = crossword.getBadWords();
        const bad = [];
        for (var i = 0; i < bad_words.length; i++) {
          bad.push(bad_words[i].word);
        }
        console.log(
          "Shoot! A grid could not be created with these words:\n" +
            bad.join("\n")
        );
      } else {
        const stats = crossword.getStats();

        const allNames = names.every((name) =>
          stats.selectedWords.includes(name)
        );
        const noEmptyBorders = !crossword.hasEmptyBorders();
        good = allNames && noEmptyBorders;

        if (good) {
          console.log("good!");
          const area = crossword.getLargestEmptyArea(areaTreshold);
          let score = stats.score / area;
          if (area >= areaTreshold) {
            score = 0;
          }
          if (score > bestScore) {
            bestScore = score;
            bestGrid = grid;
            bestLegend = crossword.getLegend();

            console.log("score", stats.score);
            console.log("nWords", stats.selectedWords.length);
            console.log("nEmpty", stats.empty);
            console.log("area", area);
            console.log("----------");
          }
        }
      }
      version++;
      if (version > tries * 0.9 && !bestGrid) {
        console.log(
          names.join("-"),
          `Nothing found after ${tries} tries, let's try again - ${attempt}`
        );
        version = 0;
        attempt++;
        if (attempt % looser === 0) {
          areaTreshold++;
          console.log("Treshold raised:", areaTreshold);
        }
      }
    } while (version < tries);

    const str = Crossword.toString(bestGrid);
    console.log(str);

    fs.writeFileSync(
      `./crosswords/${code}.json`,
      JSON.stringify({ grid: bestGrid, legend: bestLegend })
    );
  }
};

export { getCodesToPlot, generateCrosswords, plotCode };
