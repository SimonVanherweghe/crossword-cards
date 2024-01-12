import random from "random";

class CrosswordCell {
  constructor(letter) {
    this.char = letter;
    this.across = null;
    this.down = null;
  }
}

class CrosswordCellNode {
  constructor(is_start_of_word, index) {
    this.is_start_of_word = is_start_of_word;
    this.index = index;
  }
}

class WordElement {
  constructor(word, index) {
    this.word = word;
    this.index = index;
  }
}

class Crossword {
  constructor(words_in, clues_in, cols = 50, rows = 50) {
    if (words_in.length < 2) throw "A crossword must have at least 2 words";
    if (words_in.length != clues_in.length)
      throw "The number of words must equal the number of clues";

    this.GRID_ROWS = rows;
    this.GRID_COLS = cols;
    this.char_index = {};
    this.bad_words = null;
    this.clues_in = clues_in;
    this.words_in = words_in;

    // build the grid;
    this.grid = new Array(this.GRID_ROWS);
    for (let i = 0; i < this.GRID_ROWS; i++) {
      this.grid[i] = new Array(this.GRID_COLS);
    }

    // build the element list (need to keep track of indexes in the originial input arrays)
    this.word_elements = [];
    for (let i = 0; i < words_in.length; i++) {
      this.word_elements.push(new WordElement(words_in[i], i));
    }

    // I got this sorting idea from http://stackoverflow.com/questions/943113/algorithm-to-generate-a-crossword/1021800#1021800
    // seems to work well
    this.word_elements.sort(function (a, b) {
      return b.word.length - a.word.length;
    });
  }

  getSquareGrid(max_tries) {
    let best_grid = null;
    let best_ratio = 0;
    for (let i = 0; i < max_tries; i++) {
      let a_grid = this.getGrid(1);
      if (a_grid == null) continue;
      let ratio =
        (Math.min(a_grid.length, a_grid[0].length) * 1.0) /
        Math.max(a_grid.length, a_grid[0].length);
      if (ratio > best_ratio) {
        best_grid = a_grid;
        best_ratio = ratio;
      }

      if (best_ratio == 1) break;
    }
    return best_grid;
  }

  // returns an abitrary grid, or null if it can't build one
  getGrid(max_tries = 10) {
    const groups = [];
    for (let tries = 0; tries < max_tries; tries++) {
      this.clear();
      let start_dir = this.randomDirection();
      let r = Math.floor(this.grid.length / 2);
      let c = Math.floor(this.grid[0].length / 2);

      const word_element =
        this.word_elements[
          Math.floor(random.float() * this.word_elements.length)
        ];

      if (start_dir == "across") {
        c -= Math.floor(word_element.word.length / 2);
      } else {
        r -= Math.floor(word_element.word.length / 2);
      }

      if (this.canPlaceWordAt(word_element.word, r, c, start_dir) !== false) {
        this.placeWordAt(
          word_element.word,
          word_element.index,
          r,
          c,
          start_dir
        );
      } else {
        this.bad_words = [word_element];
        continue;
      }

      // start with a group containing all the words (except the first)
      // as we go, we try to place each word in the group onto the grid
      // if the word can't go on the grid, we add that word to the next group

      groups.push(this.word_elements.slice(1));
      let word_has_been_added_to_grid = false;
      for (let g = 0; g < groups.length; g++) {
        word_has_been_added_to_grid = false;
        for (let i = 0; i < groups[g].length; i++) {
          const word_element = groups[g][i];
          const best_position = this.findPositionForWord(word_element.word);
          if (!best_position) {
            /*  if (groups.length - 1 == g) groups.push([]);
            groups[g + 1].push(word_element); */
            continue;
          } else {
            const r = best_position["row"],
              c = best_position["col"],
              dir = best_position["direction"];
            this.placeWordAt(word_element.word, word_element.index, r, c, dir);
            word_has_been_added_to_grid = true;
          }
        }
        if (!word_has_been_added_to_grid) break;
      }
      if (word_has_been_added_to_grid) return this.grid;
    }

    this.bad_words = groups[groups.length - 1];
    return null;
  }

  // returns the list of WordElements that can't fit on the crossword
  getBadWords() {
    return this.bad_words;
  }

  getStats() {
    const legend = this.getLegend();
    const selectedWords = [
      ...legend.across.map((word) => word.word),
      ...legend.down.map((word) => word.word),
    ];
    const empty = this.countEmptySquares();

    const stats = {
      selectedWords,
      empty,
      score: selectedWords.length / empty,
    };
    return stats;
  }

  getLargestEmptyArea(limit) {
    const grid = this.grid;
    const rows = this.grid.length;
    const cols = this.grid[0].length;
    let maxCount = 0;

    function dfs(row, col, count, visited) {
      if (
        row < 0 ||
        col < 0 ||
        row >= rows ||
        col >= cols ||
        visited[row][col] ||
        grid[row][col] !== null
      ) {
        return count;
      }

      count++;
      visited[row][col] = true;

      // Check adjacent cells
      count = Math.max(
        dfs(row + 1, col, count, visited), // down
        dfs(row - 1, col, count, visited), // up
        dfs(row, col + 1, count, visited), // right
        dfs(row, col - 1, count, visited) // left
      );

      visited[row][col] = false; // Reset the visited flag for backtracking
      return count;
    }

    // Iterate through the grid to find 'X' cells
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (grid[i][j] === null) {
          const visited = new Array(rows)
            .fill(0)
            .map(() => new Array(cols).fill(false));
          maxCount = Math.max(maxCount, dfs(i, j, 0, visited));
          if (maxCount >= limit) return maxCount;
        }
      }
    }

    return maxCount;
  }

  hasEmptyBorders() {
    const grid = this.grid;
    const rows = this.grid.length;
    const cols = this.grid[0].length;

    if (
      grid[0].every((cell) => cell === null) ||
      grid[rows - 1].every((cell) => cell === null)
    ) {
      return true;
    }

    if (
      grid.map((row) => row[0]).every((cell) => cell === null) ||
      grid.map((row) => row[cols - 1]).every((cell) => cell === null)
    ) {
      return true;
    }
    return false;
  }

  countEmptySquares() {
    let count = 0;
    for (let r = 0; r < this.grid.length; r++) {
      for (let c = 0; c < this.grid[r].length; c++) {
        if (this.grid[r][c] == null) count++;
      }
    }
    return count;
  }

  // get two arrays ("across" and "down") that contain objects describing the
  // topological position of the word (e.g. 1 is the first word starting from
  // the top left, going to the bottom right), the index of the word (in the
  // original input list), the clue, and the word itself
  getLegend() {
    const groups = { across: [], down: [] };
    let position = 1;
    for (let r = 0; r < this.grid.length; r++) {
      for (let c = 0; c < this.grid[r].length; c++) {
        const cell = this.grid[r][c];
        let increment_position = false;
        // check across and down
        for (let k in groups) {
          // does a word start here? (make sure the cell isn't null, first)
          if (cell && cell[k] && cell[k]["is_start_of_word"]) {
            const index = cell[k]["index"];
            groups[k].push({
              position: position,
              index: index,
              clue: this.clues_in[index],
              word: this.words_in[index],
            });
            increment_position = true;
          }
        }

        if (increment_position) position++;
      }
    }
    return groups;
  }

  // move the grid onto the smallest grid that will fit it
  minimizeGrid() {
    // find bounds
    let r_min = this.GRID_ROWS - 1,
      r_max = 0,
      c_min = this.GRID_COLS - 1,
      c_max = 0;
    for (let r = 0; r < this.GRID_ROWS; r++) {
      for (let c = 0; c < this.GRID_COLS; c++) {
        const cell = this.grid[r][c];
        if (cell != null) {
          if (r < r_min) r_min = r;
          if (r > r_max) r_max = r;
          if (c < c_min) c_min = c;
          if (c > c_max) c_max = c;
        }
      }
    }
    // initialize new grid
    const rows = r_max - r_min + 1;
    const cols = c_max - c_min + 1;
    let new_grid = new Array(rows);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        new_grid[r] = new Array(cols);
      }
    }

    // copy the grid onto the smaller grid
    for (let r = r_min, r2 = 0; r2 < rows; r++, r2++) {
      for (let c = c_min, c2 = 0; c2 < cols; c++, c2++) {
        new_grid[r2][c2] = this.grid[r][c];
      }
    }

    return new_grid;
  }

  // helper for placeWordAt();
  addCellToGrid(
    word,
    index_of_word_in_input_list,
    index_of_char,
    r,
    c,
    direction
  ) {
    const char = word.charAt(index_of_char);
    if (this.grid[r][c] == null) {
      this.grid[r][c] = new CrosswordCell(char);

      // init the char_index for that character if needed
      if (!this.char_index[char]) this.char_index[char] = [];

      // add to index
      this.char_index[char].push({ row: r, col: c });
    }

    const is_start_of_word = index_of_char == 0;
    this.grid[r][c][direction] = new CrosswordCellNode(
      is_start_of_word,
      index_of_word_in_input_list
    );
  }

  // place the word at the row and col indicated (the first char goes there)
  // the next chars go to the right (across) or below (down), depending on the direction
  placeWordAt(word, index_of_word_in_input_list, row, col, direction) {
    if (direction === "across") {
      for (let c = col, i = 0; c < col + word.length; c++, i++) {
        this.addCellToGrid(
          word,
          index_of_word_in_input_list,
          i,
          row,
          c,
          direction
        );
      }
    } else if (direction === "down") {
      for (let r = row, i = 0; r < row + word.length; r++, i++) {
        this.addCellToGrid(
          word,
          index_of_word_in_input_list,
          i,
          r,
          col,
          direction
        );
      }
    } else {
      throw new Error("Invalid Direction");
    }
  }

  // you can only place a char where the space is blank, or when the same
  // character exists there already
  // returns false, if you can't place the char
  // 0 if you can place the char, but there is no intersection
  // 1 if you can place the char, and there is an intersection
  canPlaceCharAt(char, row, col) {
    // no intersection
    if (this.grid[row][col] == null) return 0;
    // intersection!
    if (this.grid[row][col]["char"] == char) return 1;

    return false;
  }

  // determines if you can place a word at the row, column in the direction
  canPlaceWordAt(word, row, col, direction) {
    // out of bounds
    if (
      row < 0 ||
      row >= this.grid.length ||
      col < 0 ||
      col >= this.grid[row].length
    )
      return false;

    let intersections = 0;
    if (direction === "across") {
      // out of bounds (word too long)
      if (col + word.length > this.grid[row].length) return false;
      // can't have a word directly to the left
      if (col - 1 >= 0 && this.grid[row][col - 1] != null) return false;
      // can't have word directly to the right
      if (
        col + word.length < this.grid[row].length &&
        this.grid[row][col + word.length] != null
      )
        return false;

      // check the row above to make sure there isn't another word
      // running parallel. It is ok if there is a character above, only if
      // the character below it intersects with the current word
      for (
        let r = row - 1, c = col, i = 0;
        r >= 0 && c < col + word.length;
        c++, i++
      ) {
        const is_empty = this.grid[r][c] == null;
        const is_intersection =
          this.grid[row][c] != null &&
          this.grid[row][c]["char"] == word.charAt(i);
        const can_place_here = is_empty || is_intersection;
        if (!can_place_here) return false;
      }

      // same deal as above, we just search in the row below the word
      for (
        let r = row + 1, c = col, i = 0;
        r < this.grid.length && c < col + word.length;
        c++, i++
      ) {
        const is_empty = this.grid[r][c] == null;
        const is_intersection =
          this.grid[row][c] != null &&
          this.grid[row][c]["char"] == word.charAt(i);
        const can_place_here = is_empty || is_intersection;
        if (!can_place_here) return false;
      }

      // check to make sure we aren't overlapping a char (that doesn't match)
      // and get the count of intersections
      intersections = 0;
      for (let c = col, i = 0; c < col + word.length; c++, i++) {
        const result = this.canPlaceCharAt(word.charAt(i), row, c);
        if (result === false) return false;
        intersections += result;
      }
    } else if (direction === "down") {
      // out of bounds
      if (row + word.length > this.grid.length) return false;
      // can't have a word directly above
      if (row - 1 >= 0 && this.grid[row - 1][col] != null) return false;
      // can't have a word directly below
      if (
        row + word.length < this.grid.length &&
        this.grid[row + word.length][col] != null
      )
        return false;

      // check the column to the left to make sure there isn't another
      // word running parallel. It is ok if there is a character to the
      // left, only if the character to the right intersects with the
      // current word
      for (
        let c = col - 1, r = row, i = 0;
        c >= 0 && r < row + word.length;
        r++, i++
      ) {
        const is_empty = this.grid[r][c] == null;
        const is_intersection =
          this.grid[r][col] != null &&
          this.grid[r][col]["char"] == word.charAt(i);
        const can_place_here = is_empty || is_intersection;
        if (!can_place_here) return false;
      }

      // same deal, but look at the column to the right
      for (
        let c = col + 1, r = row, i = 0;
        r < row + word.length && c < this.grid[r].length;
        r++, i++
      ) {
        const is_empty = this.grid[r][c] == null;
        const is_intersection =
          this.grid[r][col] != null &&
          this.grid[r][col]["char"] == word.charAt(i);
        const can_place_here = is_empty || is_intersection;
        if (!can_place_here) return false;
      }

      // check to make sure we aren't overlapping a char (that doesn't match)
      // and get the count of intersections
      intersections = 0;
      for (let r = row, i = 0; r < row + word.length; r++, i++) {
        const result = this.canPlaceCharAt(word.charAt(i), r, col);
        if (result === false) return false;
        intersections += result;
      }
    } else {
      throw new Error("Invalid Direction");
    }
    return intersections;
  }

  randomDirection() {
    return random.boolean() ? "across" : "down";
  }

  findPositionForWord(word) {
    // check the char_index for every letter, and see if we can put it there in a direction
    let bests = [];
    for (let i = 0; i < word.length; i++) {
      let possible_locations_on_grid = this.char_index[word.charAt(i)];
      if (!possible_locations_on_grid) continue;
      for (let j = 0; j < possible_locations_on_grid.length; j++) {
        let point = possible_locations_on_grid[j];
        let r = point["row"];
        let c = point["col"];
        // the c - i, and r - i here compensate for the offset of character in the word
        let intersections_across = this.canPlaceWordAt(
          word,
          r,
          c - i,
          "across"
        );
        let intersections_down = this.canPlaceWordAt(word, r - i, c, "down");

        if (intersections_across !== false)
          bests.push({
            intersections: intersections_across,
            row: r,
            col: c - i,
            direction: "across",
          });
        if (intersections_down !== false)
          bests.push({
            intersections: intersections_down,
            row: r - i,
            col: c,
            direction: "down",
          });
      }
    }

    if (bests.length == 0) return false;

    // find a good random position
    const best = bests[Math.floor(random.float() * bests.length)];

    return best;
  }

  clear() {
    for (let r = 0; r < this.grid.length; r++) {
      for (let c = 0; c < this.grid[r].length; c++) {
        this.grid[r][c] = null;
      }
    }
    this.char_index = {};
  }

  static toString(grid) {
    if (!grid) return "Grid is null";
    const result = [];
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        const cell = grid[r][c];
        if (cell == null) {
          result.push(" . ");
        } else {
          result.push(` ${cell["char"].toUpperCase()} `);
        }
      }
      result.push("\n");
    }
    return result.join("");
  }
}

export { Crossword };
