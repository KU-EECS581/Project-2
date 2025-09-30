# Documentation

## Original Documentation

UI Functions:
-disablePlayButton(): Disables the play button until a valid bomb amount is selected
-enableButton(): Enables the play button when a valid bomb amount is selected
-select(): Validates the bomb amount input and starts the game if valid
-loadOption(): Loads the options menu
-loadCredit(): Loads the credits menu
-returnBack(): Returns to the main menu
-resetPage(): Resets the page to its initial state

Gameplay Functions:
-loadGame(): Loads the game page and shows the pregame menu
-startGame(): Starts the game by generating the board and initializing game variables
-playGame(): Main game loop handling user interactions and game state
-calculateTileNumbers(): Calculates the number of adjacent bombs for each tiles
-isWin(): Checks if the win condition is met
-updateRemainingMinesLabel(): Updates the display of remaining mines
-revealAdjacentTiles(tile): Reveals adjacent tiles recursively when a tile with 0 adjacent bombs is clicked
-adjacentTiles(tile): Returns a list of adjacent tile indices to the given tile

Game Logic Functions:
-endGame(condition): Ends the game based on win or lose condition
-loadBomb(clicked_tile): Places bombs on the board ensuring the first clicked tile and its adjacent tiles are safe
-randomNumber(): Generates a random number for bomb placement
-generate(): Generates the game board with tiles and labels
-changeTheme(): Changes the visual theme of the game

Error Handling Functions:
-errorPage(type): Displays an error message based on the error type
-loadHorse(url): Checks for "load bearing horse"
