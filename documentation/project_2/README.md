# Project 2 Documentation

The majority of the documentation can be found within the code itself as docstrings, so this document is mainly a collection of the common terms/data structures.

## Constants

Originally, there were only a few constants which were stored in the same file. Now, constants are located in [`constants.js`](src/constants.js).

- `MIN_BOMBS`: the minimum number of bombs.
- `MAX_BOMBS`: the max number of bombs.
- `ROW_COUNT`: the number of rows in the grid.
- `COL_COUNT`: the number of columns in the grid.
- `ALPHABET`: the alphabet in uppercase as a string.
- `HORSE_IMAGE_PATH`: the path to the "horse" image in the assets. This was a hard-coded value from the previous group's implementation, and I have no idea what its use is other than to stop the program from crashing and checking if the assets folder exists.
- `AI_MOVE_DELAY_MS`: the delay between a player's move and the AI's move in milliseconds.

### Enums

Enums are not in native JavaScript, so for our purposes, an "enum" is a group of constants with a specific prefix. These were a result of creating constants to fix/replace magic values.

- `PAGE`: represents a page of the application (i.e. main menu page, options page, credits page, etc.).
- `STATE`: represents the state of the application/game (this is from the original code; could be condensed into "page" somewhat).
- `THEME`: reprsents the various supported themes of the application.
- `END`: represents the different end conditions for the player (mainly just win or lose).
- `DIFFICULTY`: represents the difficulty level of the AI solver.
- `TURN`: represents the turn for whoever is currently playing the game.
- `ERROR`: represents the most common errors in the application (mainly checking for assets folder).

## Classes

In the original application, everything was stored in the same JavaScript file and was classless. Now, each element of the application is separated out to help cut down on coupling and keeping a nicer separation of concerns.

- `App`: A singleton-like class responsible for highest-level page navigation and non-game-related activities.
- `UIManager`: A singleton-like class responsible for centralizing UI modifications and separating them from logic.
- `AI`: Stores method and states for the AI solver.
- `Game`: Stores logic and state for the minesweeper game.

## Util Functions

Some functions do not fit within a specific scope, or were specific enough to not be grouped with other components. These utility functions are located within [`utils.js`](src/utils.js).

- `randomNumber(max)`: generates a random number based on the "max" value.
- `difficultyToString(difficulty)`: takes a difficulty "enum" and returns it's string representation.
