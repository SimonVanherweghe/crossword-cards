# The Little Things In Life New Year's Crossword Card Generator

This is the code for a New Year's card generator. The cards consist out of a crossword puzzle about the happy little things in life.

The generation of the crosswords is an updated version of the [Crossword Generator](https://github.com/satchamo/Crossword-Generator/tree/master/crossword) by [satchamo](https://github.com/satchamo)

## Installation

Well... this is a mix of NodeJS, Python and Bash scripts. [ZX](https://google.github.io/zx/) is the glue between them all.

### Google sheets

The clues for the crossword, the names for the addressed (their names are in the crossword...) and the adresses (for the envelope) are all in a Google Sheet. Get yourself a Google API key and put it in the `.env` file.

| A | B | C | D | E | F | G | H | I | J | K | L | M |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| code | namesstring | name1 | name2 | name3 | name4 | name5 |  |  | addressline1 | addressline2 | addressline3 | addressline4 |
| =leftb(REGEXREPLACE(md5(B1);"[0,1]+";"");6) | =LOWER(CONCATENATE(C1:I1)) | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |

### Output directories

The output directories are not in the repo. Create them yourself:

```bash
crosswords/
gcode/clues/
gcode/envelop/
gcode/grid/
svgs/clues/
svgs/envelop/
svgs/grid/
svgs/solution/
```

### Vpype

Awesome tool to manipulate SVGs. See [Vpype](https://vpype.readthedocs.io/en/latest/install.html) for installation instructions.

## Usage

These are the commands one can run:

- `--penup` - move the pen up
- `--pendown` - move the pen down
- `--generate` - generate the crosswords (that are not yet generated). This will make the crosswords themselves, saved as a JSON file. It will also generate the SVGs for the clues, the grid, the envelope and the solution. Finally, it will transform them into gcode.
- `--code` and `--type` - to plot a single gcode file. One can choose 'grid', 'clues' or 'envelop' as the type and a code as the code.
- `--conveyor` - to plot all the gcode files that are not yet listed in the `plotted.txt` file. When finished plotting a file, it will ask you to press any key to coninue. This way you can change the paper.
