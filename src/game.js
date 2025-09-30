/**
File: game.js
EECS 581 - Group 21
Project 1 - Minesweeper
Authors: Evan Zhuo, Ian Foerwiser, Jack Morice, Zhang Chen, Alex Carillo
This file contains all the JavaScript code for the actual game of minesweeper
It is sectioned off based on purpose of each function/code (ui, gameplay, logic, etc)
The only inputs taken in are from the user clicking buttons to navigate the page and play the game, or choosing a bomb amount
The outputs are the visual display of the game, as well as text prompts to the user detailing the game status


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
- changeTheme(): Changes the visual theme of the game


Error Handling Functions:
-errorPage(type): Displays an error message based on the error type
- loadHorse(url): Checks for "load bearing horse"
*/

// Global Variables
const MIN_BOMBS = 10; // Minimum number of bombs allowed
const MAX_BOMBS = 20; // Maximum number of bombs allowed
const ALPHABET = "abcdefghijklmnopqrstuvwxyz".toUpperCase(); // For columns

// State "Enum"
const STATE_MAIN_MENU = 0; // Main Menu State
const STATE_ACTIVE_GAME = 1;
const STATE_GAME_OVER = 2; // Game Over State
const STATE_OPTIONS = 3; // Options Menu State
const STATE_CREDITS = 4; // Credits Menu State

// Theme "Enum"
const THEME_DEFAULT = 0; // Default Theme
const THEME_DARK = 1; // Dark Theme
const THEME_CLASSIC = 2; // Classic Theme

// End Game Condition "Enum"
const END_WIN = 1; // Win Condition
const END_LOSE = 2; // Lose Condition

// Error "Enum"
const ERROR_HORSE = 1; // Horse Error
const ERROR_UNKNOWN_END = 2; // Unknown End Condition Error

///====== UIManager "singleton"
/**
 * Added by RM to handle all UI related functions and 
 * A "singleton".
 */
class UIManager {
    // Menu Elements
    // Each menu corresponds to its div in the index.html file
    PAGE_MAIN_MENU = document.getElementById("pageMain");
    PAGE_GAME_MENU = document.getElementById("pageGame");
    PAGE_OPTION_MENU = document.getElementById("pageOptions");
    PAGE_CREDIT_MENU = document.getElementById("pageCredits");
    PAGE_PREGAME_MENU = document.getElementById("pagePreGame");

    // Buttons
    // Each button corresponds to its element in the index.html file
    buttonPlay = document.getElementById("buttonPlay");
    buttonOption = document.getElementById("buttonOption");
    buttonCredit = document.getElementById("buttonCredit");
    buttonTheme = document.getElementById("buttonTheme");
    buttonSelect = document.getElementById("buttonSelect");
    buttonReset = document.getElementById("buttonReset");

    // Setting Elements
    // Each element corresponds to its respective version in the index.html file
    board = document.getElementById("divBoard");
    bombAmountInput = document.getElementById("bombAmount");
    labelGameStatus = document.getElementById("labelGameStatus");
    msTiles = document.querySelectorAll("#msTile");
    labelMineNum = document.getElementById("labelMineNum");

    // Theme
    currentTheme = THEME_DEFAULT;
    
    /**
     * Disables the play button
     */
    disablePlayButton() {
        this.buttonPlay.disabled = true;
    }

    /**
     * Enables the play button
     */
    enablePlayButton() {
        this.buttonPlay.disabled = false;
    }

    /**
     * Sets the game status message
     * @param {*} message
     */
    setGameStatus(message) {
        this.labelGameStatus.innerHTML = message;
    }

    /**
     * Sets the title message
     * @param {*} message
     */
    setTitle(message) {
        document.getElementById("labelTitle").innerHTML = message;
    }

    /**
     * Updates the display of remaining mines
     */
    updateRemainingMinesLabel(userFlagCount = 0) {
        const remaining = Math.max(0, parseInt(this.bombAmountInput.value, 10) - userFlagCount); // Calculate the remaining mines
        this.labelMineNum.innerHTML = remaining; // Update the labelMineNum element
    }

    /**
     * Changes the visual theme of the game
     */
    changeTheme() {
        let theme = document.body; //Get the body element
        this.currentTheme++; //Increment the theme
        if (this.currentTheme == THEME_CLASSIC+1) this.currentTheme = THEME_DEFAULT; //Reset if out of bounds

        //Theme Toggle
        switch (this.currentTheme) {
            case THEME_DEFAULT:
                theme.classList.toggle("dark-mode");
                theme.classList.toggle("classic-mode");
                this.buttonTheme.innerHTML = "Default Theme";
                this.setGameStatus("Theme changed to Default Theme");
                break;
            case THEME_DARK:
                theme.classList.toggle("dark-mode");
                this.buttonTheme.innerHTML = "Dark Theme";
                this.setGameStatus("Theme changed to Dark Theme");
                break;
            case THEME_CLASSIC:
                theme.classList.toggle("classic-mode");
                this.buttonTheme.innerHTML = "Classic Theme";
                this.setGameStatus("Theme changed to Classic Theme");
                break;
        }
    }

    /**
     * Handles error display and UI changes based on the error type.
     * @param {*} type The type of error to display.
     */
    errorPage(type) {
        this.setTitle("Error Detected");

        //Remove All UI
        this.bombAmountInput.remove();
        this.buttonSelect.remove();
        this.buttonPlay.remove();

        //Error Type if-else Block
        switch (type) {
            case ERROR_HORSE:
                this.setGameStatus("Image not detected. Please ensure the '../assets/images' folder is present in the file directory.");
                break;
            case ERROR_UNKNOWN_END:
                this.setGameStatus("Error 02: Unknown Game End Condition - Use the 'Reset' Button to reload the page.");
                break;
        }
    }
}

const UI = new UIManager();

/**
 * Added by RM to hold game state and elements.
 * A "singleton".
 */
class Game {
    // In-Game Elements
    bombTiles = []; // list of tiles with bombs
    safeTiles = []; // list of tiles without bombs
    flaggedTiles = []; // list of flagged tiles
    adjacentFCTiles = []; // list of adjacent tiles to first clicked tile
    boardSize = 0; // Size of board
    userFlagCount = 0; // Number of flags placed by user
    actualFlaggedBombCount = 0; // Number of correctly flagged bombs
    state = STATE_MAIN_MENU; // 0: Main Menu | 1: Active Game | 2: Options | 3: Credits
    isLeftClicked = false; // First Left Click Gate

    /**
     * Checks if the win condition is met
     * @returns true if the win condition is met, false otherwise
     */
    isWin() {
        // If the number of flagged tiles equals the number of bomb tiles, and all bomb tiles are flagged, return true
        // TODO: this is a bad way to check win condition.
        return (this.actualFlaggedBombCount === this.bombTiles.length);
    }

    /**
     * Starts the game by generating the board and initializing game variables
     */
    startGame() {
        UI.setGameStatus("There will be " + UI.bombAmountInput.value + " bombs. The Game Is Now In Progress, Good Luck!"); // Tell the user the amount of bombs and say the game has begun
        UI.PAGE_GAME_MENU.style.display = 'block'; //Show the game menu
        UI.PAGE_PREGAME_MENU.style.display = 'none'; //Hide the pregame menu
        this.generate(); //generate the x by x board
        this.playGame(); //start the actual game
    }

    /**
     * Gets all adjacent tiles to the first clicked tile
     * @param {*} tile 
     * @returns 
     */
    _adjacentTiles(tile) { //Get all adjacent tiles to the first clicked tile
        const tileId = parseInt(tile.id.split('-')[1]); //Get the number ID of the tile
        const leftEdge = (tileId % 10 === 0); //Check if it's on the left edge
        const rightEdge = (tileId % 10 === 9); //Check if it's on the right edge
        const neighbors = []; //hold adjacent tile
        if (tileId >= 10) { //If not on the top row
            if (!leftEdge) neighbors.push(tileId - 11); //northwest
            neighbors.push(tileId - 10); //north
            if (!rightEdge) neighbors.push(tileId - 9); //northeasst
        }
        if (!leftEdge) neighbors.push(tileId - 1); //west
        if (!rightEdge) neighbors.push(tileId + 1); //east
        if (tileId < this.boardSize - 10) { //If not on the bottom row
            if (!leftEdge) neighbors.push(tileId + 9); //southwest
            neighbors.push(tileId + 10); //south
            if (!rightEdge) neighbors.push(tileId + 11); //southeast
        }
        return neighbors; //return the list of adjacent tiles
    }

    /**
     * Reveals all adjacent tiles recursively if they are not bombs.
     * Zhang: implementation for revealing adjacent tile, logic is similar to calculateTileNumbers, but this time use recursive to keep revealing tiles until all safe tiles are uncovered
     * @param {*} tile
     */
    revealAdjacentTiles(tile) {
        const neighbors = this._adjacentTiles(tile); // Get all adjacent tiles

        // Iterate over all adjacent tiles
        for (const neighborId of neighbors) { 
            const neighborTile = document.getElementById("msTile-" + neighborId); //Get the tile element
            if (neighborTile && !neighborTile.revealed && !neighborTile.bomb) { //If the tile exists, is not revealed, and is not a bomb
                neighborTile.classList.add('revealed-' + neighborTile.value); // Reveal the tile
                neighborTile.revealed = true; // Set the tile as revealed
                if (neighborTile.value == 0) { //If the tile's value is 0
                    this.revealAdjacentTiles(neighborTile); // Recursively reveal tiles
                }
            }
        }
    }

    /**
     * Main game loop handling user interactions and game state
     */
    playGame() {
        this.state = STATE_ACTIVE_GAME; //Set the game as Active
        this.userFlagCount = 0; //Reset user flag count
        this.actualFlaggedBombCount = 0; //Reset actual flagged bomb count
        this.flaggedTiles = []; //Reset flagged tiles
        UI.updateRemainingMinesLabel(this.userFlagCount); //Update remaining mines display

        // Add Event Listeners
        document.addEventListener('click', this._handleLeftClick.bind(this));
        document.addEventListener('contextmenu', this._handleRightClick.bind(this));
    }

    /**
     * Handle left click events on the game board
     * @param {*} event 
     */
    _handleLeftClick(event) {
        //console.log(isLeftClicked); //test line [DELETE LATER]
        if (event.target.id && event.target.id.startsWith("msTile-")) {
            if (!this.isLeftClicked) { //check if this is the first click or not, so we can generate the bombs
                this.isLeftClicked = true; //change flag
                //Zhang: added the new parameter and function
                this.adjacentFCTiles = this._adjacentTiles(event.target); //Get all adjacent tiles to the first clicked tile
                this.loadBomb(event.target); //generate all bombs on the board
                this.calculateTileNumbers(); //calculate the numbers for each tile
            }
            if (this.state == STATE_ACTIVE_GAME) { //Check if game is active
                if (event.target.bomb == true && event.target.flagged == false) { //If a bomb tile is clicked and not flagged
                    event.target.classList.add('bomb'); // Add bomb image (NOTE: StackOverflow, geeksforgeeks, and MDN web docs were used for help)
                    this.state = STATE_GAME_OVER; //Disable Game
                    this.endGame(END_LOSE); //End Game
                }
                if (event.target.bomb == false && event.target.revealed == false && event.target.flagged == false) { //if the tile is not a bomb and hasn't been touched yet and is not flagged
                    event.target.classList.add('revealed-' + event.target.value); // Add revealed image based on value
                    event.target.revealed = true; // Set the tile as revealed
                    //Zhang: revealing surrounding tiles instead of just having one tile revealed when clicking
                    if (event.target.value == 0) {
                        this.revealAdjacentTiles(event.target); // Reveal adjacent tiles if the value is 0
                    }
                }
                if (this.isWin()){ //Check if all bombs are flagged
                    this.endGame(END_WIN); //Win game
                }
                //Otherwise, (aka if it's flagged or revealed) do nothing to it
            }
        }
    }

    /**
     * Handle right click events on the game board
     * @param {*} event 
     */
    _handleRightClick(event) {
        event.preventDefault(); // Prevent default context menu
        //used Reddit to find similar function and learn target
        if (event.target.matches('button') && this.state == STATE_ACTIVE_GAME && this.isLeftClicked) { //Check if game is active
            const tile = event.target; //Get the tile element
            if (tile.flagged == false && !tile.revealed) { //Check if tile is already flagged and not revealed yet
                tile.flagged = true; //set the flag status to true
                tile.classList.add('flagged'); // Add flag image
                this.flaggedTiles.push(tile); //Add to flagged tiles
                this.userFlagCount++; //Increment user flag count
                if (tile.bomb === true) this.actualFlaggedBombCount++; //If the flagged tile is a bomb, increment the actual flagged bomb count
                UI.updateRemainingMinesLabel(this.userFlagCount); //Update remaining mine count
                if (this.isWin()) { //Check if all bombs are flagged
                    this.endGame(END_WIN); //Win game
                }
            } else if (tile.flagged == true && !tile.revealed) { //If the tile is already flagged and not revealed yet
                tile.flagged = false; //set the flag status to false
                tile.classList.remove('flagged');
                const idx = this.flaggedTiles.indexOf(tile); //Find the index of the tile in the flagged tiles array
                if (idx > -1) this.flaggedTiles.splice(idx, 1);
                this.userFlagCount = Math.max(0, this.userFlagCount - 1); //Decrement user flag count
                if (tile.bomb === true) this.actualFlaggedBombCount = Math.max(0, this.actualFlaggedBombCount - 1);
                //event.target.flagged = false; //set the flag status to false
                //event.target.classList.remove('flagged'); // Remove flag image   
                //flaggedTiles.splice(flaggedTiles.indexOf(event.target), 1); //Remove from flagged tiles
                UI.updateRemainingMinesLabel(this.userFlagCount); //Update remaining mine count
            }
        }
    }

    /**
     * Zhang: Function to calculate the number of adjacent bombs for each tile
     */
    calculateTileNumbers(){
        for (let i = 0; i < this.boardSize; i++){ //For each tile on the board
            let tile = document.getElementById("msTile-"+ i); //Get the tile element
            if (!tile.bomb){ //If the tile is not a bomb
                let adjacentBombs = 0; //Counter for adjacent bombs
                const leftEdge = (i % 10 === 0); //Check if it's on the left edge
                const rightEdge = (i % 10 === 9); //Check if it's on the right edge
                if (i > 9 && !leftEdge && document.getElementById("msTile-"+ (i-11)).bomb) adjacentBombs++; //top-left
                if (i > 9 && document.getElementById("msTile-"+ (i-10)).bomb) adjacentBombs++; //top
                if (i > 9 && !rightEdge && document.getElementById("msTile-"+ (i-9)).bomb) adjacentBombs++; //top-right
                if (!leftEdge && document.getElementById("msTile-"+ (i-1)).bomb) adjacentBombs++; //left
                if (!rightEdge && document.getElementById("msTile-"+ (i+1)).bomb) adjacentBombs++; //right
                if (i < this.boardSize - 10 && !leftEdge && document.getElementById("msTile-"+ (i+9)).bomb) adjacentBombs++; //bottom-left
                if (i < this.boardSize - 10 && document.getElementById("msTile-"+ (i+10)).bomb) adjacentBombs++; //bottom
                if (i < this.boardSize - 10 && !rightEdge && document.getElementById("msTile-"+ (i+11)).bomb) adjacentBombs++; //bottom-right
                tile.value = adjacentBombs; //Set the tile's value to the number of adjacent bombs
            }
        }
    }

    ///======== Game Logic Function
    /**
     * Ends the game and reveals all bombs if the player loses.
     * @param {*} condition 
     */
    endGame(condition) {
        if (condition == END_LOSE) { //Lose Condition
            UI.setGameStatus("GAME OVER! You hit a bomb!"); // Notify the user they lost
            for (let i = 0; i < this.bombTiles.length; i++) { //Reveal all bombs when the game ends
                if (!this.bombTiles[i].flagged) { //If the bomb tile is not flagged
                    this.bombTiles[i].classList.add('bomb'); // Reveal the bomb
                }
            }
        } else if (condition == END_WIN) { //Win Condition
            UI.setGameStatus("CONGRATULATIONS! YOU WIN!"); // Notify the user they won
        } else {
            UI.errorPage(ERROR_UNKNOWN_END); //Unknown Condition, throw error
        }
    }
                

    /**
     * Zhang: redefine this function to assign value to the tile at the same time
     */
    loadBomb(clicked_tile) { //Generate bombs on the board
        let bombCounter = UI.bombAmountInput.value; //Get the number of bombs to place
        while (bombCounter > 0) { //While there are still bombs to place
            let randomValue = randomNumber(this.boardSize); //Get a random number
            let tile = document.getElementById("msTile-"+ randomValue); //Get the tile element
            if (tile.id !== clicked_tile.id && !this.adjacentFCTiles.includes(randomValue) && tile.bomb !== true){ //Ensure the first clicked tile is not a bomb or a number tile
                tile.bomb = true; //Set the tile as a bomb
                this.bombTiles.push(tile); //Add to bomb tiles
                bombCounter--; //Decrease the bomb counter
            }
        } 
    }

    /**
     * Generates the column headers for the game board
     */
    _generateColumnHeaders() {
        const headerRow = document.createElement('div'); // Create a div to store column headers
        headerRow.setAttribute('style', 'display:flex ; align-items:center; justify-content:center;'); //Style the header row
        UI.board.appendChild(headerRow); // Append the div to the board slot

        const corner = document.createElement('div'); // Top-left corner creation
        corner.style.width = '50px';
        headerRow.append(corner);

        for(let i = 0; i < 10; i++){ //column headers
            const colLabel = document.createElement('div'); // Create a div to store column labels
            var letter = ALPHABET.substring(i,i+1); //Get the letter for the column
            colLabel.innerText = letter; //Set the text of the column label
            colLabel.setAttribute('style','align-items:center ;width:50px; height:50px; display:flex ;justify-content:center;'); //Style it
            headerRow.append(colLabel); //Append it to the header row
        }
    }

    /**
     * Generates the rows and tiles for the game board
     */
    _generateRows() {
        let idNum = 0; //ID number for each button
        for (let i = 0; i < 10; i++) { //rows
            const msRow = document.createElement('div'); // Create a div to store buttons
            msRow.setAttribute('style', 'display:flex ; align-items:center; justify-content:center;') //Style the row
            UI.board.appendChild(msRow); // Append the div to the board slot

            const rowLabel = document.createElement('div'); // Create a div to store row labels
            rowLabel.setAttribute('style','align-items:center ;width:50px; height:50px; display:flex ;justify-content:center') //Style it
            var txt = (i+1).toString(); //Get the number for the row
            rowLabel.innerText = txt; //Set the text of the row label
            msRow.appendChild(rowLabel) //Append it to the row

            for (let j = 0; j < 10; j++) {
                const msButton = document.createElement('button'); // Create buttons k times
                msButton.id = "msTile-"+idNum;// assign unique ID for tracking
                // msButton.value = 0; // Set initial value, 0 is a bomb/empty tile, and then 1-3 for amount of bombs around it
                msButton.bomb = false;
                msButton.revealed = false;
                msButton.flagged = false;
                msButton.image = null;
                msRow.appendChild(msButton); // Append buttons to the row
                idNum++;
            }
        }
        this.boardSize = idNum; // Number is used for randomizer, fix code
        //I call this one div hellscape
        // awesome comment - RM
    }

    /**
     * Generates the game board with tiles and labels
     */
    generate() {
        this._generateColumnHeaders(); // Generate column headers
        this._generateRows(); // Generate rows and tiles
    }
}

class App {
    game = new Game(); // The game instance

    /**
     * Loads the horse image.
     * @param {*} url - The URL of the horse image.
     */
    loadHorse(url) { 
        var horse = new Image();
        horse.src = url;
        if (horse.width == 0) {
            UI.errorPage(ERROR_HORSE)
        } else this.returnBack();
    }

    /**
     * Selects the bomb amount and starts the game
     * @returns {void}
     */
    select() {
        let bombValue = UI.bombAmountInput.value; // Get the value of the bomb amount input
        if (bombValue < MIN_BOMBS || bombValue > MAX_BOMBS) { // Check if the bomb amount is out of range
            alert(`Please select a bomb value between ${MIN_BOMBS} and ${MAX_BOMBS}.`); // Alert the user
            UI.disablePlayButton();
            UI.setGameStatus(`Please select a bomb value between ${MIN_BOMBS} and ${MAX_BOMBS}.`); // Update the notification
            return; // Exit the function if the bomb amount is invalid
        }

        // Zhang: Add a check to ensure bomb amount is within requirement
        UI.enablePlayButton(); // Enable Play Button
        UI.bombAmountInput.style.display = 'none'; // Hide the bomb input
        UI.buttonSelect.style.display = 'none'; // Hide the select button
        this.game.startGame(); // Start the game
    }

    /**
     * Loads the options menu
     */
    loadOption() {
        UI.setGameStatus(''); // Clear the labelGameStatus
        this.game.state = STATE_OPTIONS; // Set the state to Options
        // Hide all unimportant menus, show only options
        UI.PAGE_MAIN_MENU.style.display = 'none'; 
        UI.PAGE_GAME_MENU.style.display = 'none';
        UI.PAGE_OPTION_MENU.style.display = 'block';
        UI.PAGE_CREDIT_MENU.style.display = 'none';
        UI.PAGE_PREGAME_MENU.style.display = 'none';
    }

    /**
     * Loads the credits menu
     */
    loadCredit() {
        UI.setGameStatus(''); //Clear the labelGameStatus
        this.game.state = STATE_CREDITS; //Set the state to Credits
        //Hide all unimportant menus, show only credits
        UI.PAGE_MAIN_MENU.style.display = 'none';
        UI.PAGE_GAME_MENU.style.display = 'none';
        UI.PAGE_OPTION_MENU.style.display = 'none';
        UI.PAGE_CREDIT_MENU.style.display = 'block';
        UI.PAGE_PREGAME_MENU.style.display = 'none';
    }

    /**
     * Returns to the main menu
     */
    returnBack() {
        UI.setGameStatus(''); //Clear the labelGameStatus
        this.game.state = STATE_MAIN_MENU; //Set the state to Main Menu
        //Hide all unimportant menus, go back to main menu
        UI.PAGE_MAIN_MENU.style.display = 'block';
        UI.PAGE_GAME_MENU.style.display = 'none';
        UI.PAGE_OPTION_MENU.style.display = 'none';
        UI.PAGE_CREDIT_MENU.style.display = 'none';
        UI.PAGE_PREGAME_MENU.style.display = 'none';
    }

    /**
     * Resets the page to its initial state.
     * Just a wrapper for reloading the page.
     */
    resetPage() {
        window.location.reload() //Reload the page
    }

    /**
     * Loads the game page and shows the pregame menu
     */
    loadGame() {
        //Load the game page and show only the pregame menu
        UI.PAGE_MAIN_MENU.style.display = 'none';
        UI.PAGE_OPTION_MENU.style.display = 'none';
        UI.PAGE_CREDIT_MENU.style.display = 'none';
        UI.PAGE_PREGAME_MENU.style.display = 'block';
        UI.setGameStatus(""); //Clear the notification
    }
}

///======= Instantiate App
const APP = new App(); // "Singleton" instance of App

///======= Utils
/**
 * Generates a random number between 0 and boardSize-1.
 * @returns A random number between 0 and boardSize-1
 * @param {*} max The upper limit for the random number generation (exclusive)
 */
function randomNumber(max) {
    let randomNum = Math.floor(Math.random() * max); // Generate a random number between 0 and max-1
    return randomNum; // Return the random number
}
