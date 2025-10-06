/**
 * Name: game.js
 * Description: Contains all the JavaScript code for the actual game of minesweeper.
 * Original Author(s): Evan Zhuo, Ian Foerwiser, Jack Morice, Zhang Chen, Alex Carillo
 * Revised Author(s): Riley Meyerkorth
 * Inputs: User control events from app.js (button clicks, game interactions)
 * Outputs: Visual display of the game, text prompts to the user
 * Dependencies: constants.js utils.js ui.js
 * Date Revised: 29 September 2025
 */

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
    
    // Turn-based system properties
    currentTurn = TURN_PLAYER; // Whose turn it is (player starts)
    turnBasedMode = false; // Whether turn-based mode is enabled
    onAITurnCallback = null; // Callback function to execute AI turns
    
    // Timer properties
    gameStartTime = null; // When the game started
    gameTimer = null; // Timer interval reference
    gameTimeElapsed = 0; // Total time elapsed in seconds

    /**
     * Initializes game variables for a new game
     */
    _init() {
        this.state = STATE_ACTIVE_GAME; //Set the game as Active
        this.userFlagCount = 0; //Reset user flag count
        this.actualFlaggedBombCount = 0; //Reset actual flagged bomb count
        this.flaggedTiles = []; //Reset flagged tiles
        this.isLeftClicked = false; //Reset first left click gate
        
        // Initialize turn-based system
        this.currentTurn = TURN_PLAYER; // Player always starts
        this.turnBasedMode = UI.checkboxEnableAI.checked; // Check if AI is enabled
        
        // Initialize timer
        this.gameTimeElapsed = 0;
        this.gameStartTime = null;
        this.gameTimer = null;
        
        UI.updateRemainingMinesLabel(this.userFlagCount);
    }

    /**
     * Initializes event listeners for user interactions.
     * Ensures no duplicate bindings.
     */
    _initEventListeners() {
        // Remove event listeners if they exist (to prevent multiple listeners being added)
        document.removeEventListener('click', this._handleLeftClick.bind(this));
        document.removeEventListener('contextmenu', this._handleRightClick.bind(this));

        // Add Event Listeners
        document.addEventListener('click', this._handleLeftClick.bind(this));
        document.addEventListener('contextmenu', this._handleRightClick.bind(this));
    }

    /**
     * Begins the main game "loop" handling user interactions and game state
     * Initializes the game and adds event listeners for user interactions
     */
    play() {
        this._init();
        this._initEventListeners();
    }

    /**
     * Starts the game by generating the board and initializing game variables
     */
    startGame() {
        UI.setGameStatus("There will be " + UI.bombAmountInput.value + " bombs. The Game Is Now In Progress, Good Luck!"); // Tell the user the amount of bombs and say the game has begun
        UI.pageGame.style.display = 'block'; //Show the game menu
        UI.pagePreGame.style.display = 'none'; //Hide the pregame menu
        this.generate(); //generate the x by x board
        this.play(); //start the actual game
        
        // Initialize turn display if in turn-based mode
        if (this.turnBasedMode) {
            this._updateTurnDisplay();
        }
    }

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
     * Checks if it's currently the player's turn
     * @returns {boolean} true if it's the player's turn
     */
    isPlayerTurn() {
        return !this.turnBasedMode || this.currentTurn === TURN_PLAYER;
    }

    /**
     * Checks if it's currently the AI's turn
     * @returns {boolean} true if it's the AI's turn
     */
    isAITurn() {
        return this.turnBasedMode && this.currentTurn === TURN_AI;
    }

    /**
     * Switches turns between player and AI
     */
    switchTurn() {
        if (!this.turnBasedMode) return; // No turn switching if not in turn-based mode
        
        this.currentTurn = (this.currentTurn === TURN_PLAYER) ? TURN_AI : TURN_PLAYER;
        this._updateTurnDisplay();
        
        // If it's now the AI's turn, execute AI move after a short delay
        if (this.currentTurn === TURN_AI) {
            setTimeout(() => {
                this._executeAITurn();
            }, AI_MOVE_DELAY_MS); // 1 second delay for better UX
        }
    }

    /**
     * Updates the UI to show whose turn it is
     */
    _updateTurnDisplay() {
        const remainingBombs = parseInt(UI.bombAmountInput.value, 10) - this.userFlagCount;
        UI.updateTurnDisplay(this.turnBasedMode, this.currentTurn, remainingBombs);
    }

    /**
     * Registers a callback function to handle AI turns
     * @param {Function} callback The function to call when it's the AI's turn
     */
    setAITurnCallback(callback) {
        this.onAITurnCallback = callback;
    }

    /**
     * Clears the AI turn callback
     */
    clearAITurnCallback() {
        this.onAITurnCallback = null;
    }

    /**
     * Public method for AI to get all available (unrevealed, unflagged) tiles
     * @returns {Array} Array of available tile elements
     */
    getAvailableTiles() {
        const availableTiles = [];
        
        for (let i = 0; i < this.boardSize; i++) {
            const tile = document.getElementById("msTile-" + i);
            if (tile && !tile.revealed && !tile.flagged) {
                availableTiles.push(tile);
            }
        }
        
        return availableTiles;
    }

    /**
     * Public method for AI to make a move (left click) on a tile
     * @param {*} tile The tile to reveal
     * @returns {boolean} true if move was successful, false otherwise
     */
    makeAILeftClick(tile) {
        if (!tile || tile.revealed || tile.flagged) return false;
        
        // Handle first click if needed
        if (!this.isLeftClicked) {
            this._handleFirstLeftClick(tile);
        }
        
        // Handle bomb click
        if (tile.bomb === true && tile.flagged === false) {
            this._handleBombClicked(tile);
            return true;
        }

        // Handle safe tile click
        if (tile.bomb === false && tile.revealed === false && tile.flagged === false) {
            tile.classList.add('revealed-' + tile.value);
            tile.revealed = true;
            if (tile.value == 0) {
                this.revealAdjacentTiles(tile);
            }
        }

        // Check win condition
        if (this.isWin()) {
            this.endGame(END_WIN);
        }
        
        return true;
    }

    /**
     * Public method for AI to flag/unflag a tile (right click)
     * @param {*} tile The tile to flag/unflag
     * @returns {boolean} true if move was successful, false otherwise
     */
    makeAIRightClick(tile) {
        if (!tile || tile.revealed) return false;
        
        if (tile.flagged) {
            // Remove flag
            tile.flagged = false;
            tile.classList.remove('flagged');
            const idx = this.flaggedTiles.indexOf(tile);
            if (idx > -1) this.flaggedTiles.splice(idx, 1);
            this.userFlagCount = Math.max(0, this.userFlagCount - 1);
            if (tile.bomb === true) this.actualFlaggedBombCount = Math.max(0, this.actualFlaggedBombCount - 1);
            UI.updateRemainingMinesLabel(this.userFlagCount);
        } else {
            // Add flag
            tile.flagged = true;
            tile.classList.add('flagged');
            this.flaggedTiles.push(tile);
            this.userFlagCount++;
            if (tile.bomb === true) this.actualFlaggedBombCount++;
            UI.updateRemainingMinesLabel(this.userFlagCount);
            
            // Check win condition
            if (this.isWin()) {
                this.endGame(END_WIN);
            }
        }
        
        return true;
    }

    /**
     * Executes an AI turn
     */
    _executeAITurn() {
        if (this.state !== STATE_ACTIVE_GAME || !this.isAITurn()) return;
        
        // Call the registered AI callback if available
        if (this.onAITurnCallback && typeof this.onAITurnCallback === 'function') {
            this.onAITurnCallback();
        }
        
        // Only switch turns if the game is still active (not ended by AI move)
        if (this.state === STATE_ACTIVE_GAME) {
            this.switchTurn();
        }
    }

    /**
     * Gets all adjacent tiles to the first clicked tile
     * @param {*} tile 
     * @returns 
     */
    _adjacentTiles(tile) { //Get all adjacent tiles to the first clicked tile
        const tileId = parseInt(tile.id.split('-')[1]); //Get the number ID of the tile
        const leftEdge = (tileId % ROW_COUNT === 0); //Check if it's on the left edge
        const rightEdge = (tileId % ROW_COUNT === (ROW_COUNT-1)); //Check if it's on the right edge
        const neighbors = []; //hold adjacent tile
        if (tileId >= ROW_COUNT) { //If not on the top row
            if (!leftEdge) neighbors.push(tileId - (ROW_COUNT+1)); //northwest
            neighbors.push(tileId - ROW_COUNT); //north
            if (!rightEdge) neighbors.push(tileId - (ROW_COUNT-1)); //northeasst
        }
        if (!leftEdge) neighbors.push(tileId - 1); //west
        if (!rightEdge) neighbors.push(tileId + 1); //east
        if (tileId < this.boardSize - ROW_COUNT) { //If not on the bottom row
            if (!leftEdge) neighbors.push(tileId + (ROW_COUNT-1)); //southwest
            neighbors.push(tileId + ROW_COUNT); //south
            if (!rightEdge) neighbors.push(tileId + (ROW_COUNT+1)); //southeast
        }
        return neighbors; //return the list of adjacent tiles
    }

    /**
     * Public method for AI to get all adjacent tile elements for a given tile
     * @param {*} tile The tile element to find neighbors for
     * @returns {Array} Array of adjacent tile elements
     */
    getAdjacentTiles(tile) {
        const indices = this._adjacentTiles(tile);
        const adjacentTiles = [];
        
        for (const index of indices) {
            const adjacentTile = document.getElementById("msTile-" + index);
            if (adjacentTile) {
                adjacentTiles.push(adjacentTile);
            }
        }
        
        return adjacentTiles;
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
            // Get the neighbor tile
            const neighborTile = document.getElementById("msTile-" + neighborId);

            // Check if tile does not exist, is revealed, or is a bomb and skip if so
            if (!neighborTile || neighborTile.revealed || neighborTile.bomb) continue;

            // Reveal the tile by marking it as such
            neighborTile.classList.add('revealed-' + neighborTile.value);
            neighborTile.revealed = true;

            // Check for empty tiles to reveal recursively
            if (neighborTile.value == 0) this.revealAdjacentTiles(neighborTile);
        }
    }

    /**
     * Handles the event when a bomb tile is left-clicked
     * @param {*} tile 
     */
    _handleBombClicked(tile) {
        tile.classList.add('bomb'); // Add bomb image (NOTE: StackOverflow, geeksforgeeks, and MDN web docs were used for help)
        this.state = STATE_GAME_OVER; //Disable Game
        this.endGame(END_LOSE); //End Game
    }

    /**
     * Handles the first left click event on the game board.
     * Check if this is the first click or not so we can generate the bombs
     * RM: I tried refactoring this to where there is a single source of truth (the game state) and it broke completely. Whatever.
     * @param {*} tile 
     */
    _handleFirstLeftClick(tile) {
        this.isLeftClicked = true; //change flag
        //Zhang: added the new parameter and function
        this.adjacentFCTiles = this._adjacentTiles(tile); //Get all adjacent tiles to the first clicked tile
        this.loadBomb(tile); //generate all bombs on the board
        this.calculateTileNumbers(); //calculate the numbers for each tile
        
        // Start the timer on first click
        this.startTimer();
    }

    /**
     * Handles user clicks during an active game (the active game state)
     * @param {*} tile 
     */
    _handleActiveGameLeftClick(tile) {
        // Check if it's player's turn in turn-based mode
        if (!this.isPlayerTurn()) {
            console.warn("Left click ignored: not player's turn");
            return;
        }

        if (tile.bomb == true && tile.flagged == false) { // If a bomb tile is clicked and not flagged
            this._handleBombClicked(tile);
            return; // Exit early since game is over
        }

        if (tile.bomb == false && tile.revealed == false && tile.flagged == false) { //if the tile is not a bomb and hasn't been touched yet and is not flagged
            tile.classList.add('revealed-' + tile.value); // Add revealed image based on value
            tile.revealed = true; // Set the tile as revealed
            //Zhang: revealing surrounding tiles instead of just having one tile revealed when clicking
            if (tile.value == 0) {
                this.revealAdjacentTiles(tile); // Reveal adjacent tiles if the value is 0
            }
            
            // Switch turns after a successful move in turn-based mode
            this.switchTurn();
        }

        if (this.isWin()){ //Check if all bombs are flagged
            this.endGame(END_WIN); //Win game
        }
        //Otherwise, (aka if it's flagged or revealed) do nothing to it
    }

    /**
     * Handle left click events on the game board
     * @param {*} event 
     */
    _handleLeftClick(event) {
        // Get the tile element
        const tile = event.target;

        // Check for correct event type
        if (!tile.id || !tile.id.startsWith("msTile-")) {
            console.warn("Left click ignored: clicked element is not a game tile.");
            return;
        }

        // Check for first left click
        if (!this.isLeftClicked) this._handleFirstLeftClick(tile);

        // Handle active game state
        if (this.state == STATE_ACTIVE_GAME) this._handleActiveGameLeftClick(tile);
    }

    /**
     * Handles the addition of a flag to a tile
     * @param {*} tile 
     */
    _handleRightClickAddFlag(tile) {
        tile.flagged = true; //set the flag status to true
        tile.classList.add('flagged'); // Add flag image
        this.flaggedTiles.push(tile); //Add to flagged tiles
        this.userFlagCount++; //Increment user flag count
        if (tile.bomb === true) this.actualFlaggedBombCount++; //If the flagged tile is a bomb, increment the actual flagged bomb count
        UI.updateRemainingMinesLabel(this.userFlagCount); //Update remaining mine count

        // Switch turns after a successful flag placement in turn-based mode
        this.switchTurn();

        // Check for win condition
        if (this.isWin()) { //Check if all bombs are flagged
            this.endGame(END_WIN); //Win game
        }
    }

    /**
     * Handles the removal of a flag from a tile
     * @param {*} tile 
     */
    _handleRightClickRemoveFlag(tile) {
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
        
        // Switch turns after a successful flag removal in turn-based mode
        this.switchTurn();
    }

    /**
     * Handle right click events on the game board
     * @param {*} event 
     */
    _handleRightClick(event) {
        event.preventDefault(); // Prevent default context menu
        //used Reddit to find similar function and learn target

        // Get the tile element
        const tile = event.target;

        // Check if game is inactive or wrong element
        if (!tile.matches('button') || this.state != STATE_ACTIVE_GAME || !this.isLeftClicked) {
            console.warn("Right click ignored: either not on a tile, game not active, or first left click not done.");
            return; //If not, ignore right click
        }

        // Check if it's player's turn in turn-based mode
        if (!this.isPlayerTurn()) {
            console.warn("Right click ignored: not player's turn");
            return;
        }

        // Check if tile is revealed
        if (tile.revealed) {
            console.warn("Right click ignored: tile is already revealed.");
            return;
        }

        // Check if tile is already flagged
        if (tile.flagged == true) { 
            this._handleRightClickRemoveFlag(tile);
            return;
        }
        
        // Otherwise, add the flag
        this._handleRightClickAddFlag(tile);
    }

    /**
     * Zhang: Function to calculate the number of adjacent bombs for each tile
     */
    calculateTileNumbers(){
        for (let i = 0; i < this.boardSize; i++){ //For each tile on the board
            let tile = document.getElementById("msTile-"+ i); //Get the tile element
            if (!tile.bomb){ //If the tile is not a bomb
                let adjacentBombs = 0; //Counter for adjacent bombs
                const leftEdge = (i % ROW_COUNT === 0); //Check if it's on the left edge
                const rightEdge = (i % ROW_COUNT === (ROW_COUNT-1)); //Check if it's on the right edge
                if (i > (ROW_COUNT-1) && !leftEdge && document.getElementById("msTile-"+ (i-(ROW_COUNT+1))).bomb) adjacentBombs++; //top-left
                if (i > (ROW_COUNT-1) && document.getElementById("msTile-"+ (i-ROW_COUNT)).bomb) adjacentBombs++; //top
                if (i > (ROW_COUNT-1) && !rightEdge && document.getElementById("msTile-"+ (i-(ROW_COUNT-1))).bomb) adjacentBombs++; //top-right
                if (!leftEdge && document.getElementById("msTile-"+ (i-1)).bomb) adjacentBombs++; //left
                if (!rightEdge && document.getElementById("msTile-"+ (i+1)).bomb) adjacentBombs++; //right
                if (i < (this.boardSize-ROW_COUNT) && !leftEdge && document.getElementById("msTile-"+ (i+(ROW_COUNT-1))).bomb) adjacentBombs++; //bottom-left
                if (i < (this.boardSize-ROW_COUNT) && document.getElementById("msTile-"+ (i+ROW_COUNT)).bomb) adjacentBombs++; //bottom
                if (i < (this.boardSize-ROW_COUNT) && !rightEdge && document.getElementById("msTile-"+ (i+(ROW_COUNT+1))).bomb) adjacentBombs++; //bottom-right
                tile.value = adjacentBombs; //Set the tile's value to the number of adjacent bombs
            }
        }
    }

    /**
     * Reveals all bombs on the board (used when the game ends)
     */
    _revealAllBombs() {
        for (let i = 0; i < this.bombTiles.length; i++) { // Reveal all bombs when the game ends
            if (!this.bombTiles[i].flagged) { //If the bomb tile is not flagged
                this.bombTiles[i].classList.add('bomb'); // Reveal the bomb
            }
        }
    }

    /**
     * Ends the game and reveals all bombs if the player loses.
     * @param {*} condition 
     */
    endGame(condition) {
        this.state = STATE_GAME_OVER; // Set game state to over
        
        // Stop the timer when game ends
        this.stopTimer();
        
        switch (condition) {
            case END_LOSE:
                if (this.turnBasedMode) {
                    if (this.currentTurn === TURN_AI) {
                        UI.setGameStatus(`CONGRATULATIONS! AI hit a bomb! You Win! (Time: ${this.gameTimeElapsed}s)`);
                    } else {
                        UI.setGameStatus(`GAME OVER! You hit a bomb! (Time: ${this.gameTimeElapsed}s)`);
                    }
                } else {
                    UI.setGameStatus(`GAME OVER! You hit a bomb! (Time: ${this.gameTimeElapsed}s)`);
                }
                this._revealAllBombs(); // Reveal all bombs
                break;
            case END_WIN:
                if (this.turnBasedMode) {
                    if (this.currentTurn === TURN_AI) {
                        UI.setGameStatus(`AI WINS! All bombs found by AI! (Time: ${this.gameTimeElapsed}s)`);
                    } else {
                        UI.setGameStatus(`CONGRATULATIONS! YOU WIN! (Time: ${this.gameTimeElapsed}s)`);
                    }
                } else {
                    UI.setGameStatus(`CONGRATULATIONS! YOU WIN! (Time: ${this.gameTimeElapsed}s)`);
                }
                break;
            default:
                UI.errorPage(ERROR_UNKNOWN_END); // Unknown Condition, throw error
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

        for(let i = 0; i < COL_COUNT; i++){ //column headers
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
        for (let i = 0; i < ROW_COUNT; i++) { //rows
            const msRow = document.createElement('div'); // Create a div to store buttons
            msRow.setAttribute('style', 'display:flex ; align-items:center; justify-content:center;') //Style the row
            UI.board.appendChild(msRow); // Append the div to the board slot

            const rowLabel = document.createElement('div'); // Create a div to store row labels
            rowLabel.setAttribute('style','align-items:center ;width:50px; height:50px; display:flex ;justify-content:center') //Style it
            var txt = (i+1).toString(); //Get the number for the row
            rowLabel.innerText = txt; //Set the text of the row label
            msRow.appendChild(rowLabel) //Append it to the row

            for (let j = 0; j < ROW_COUNT; j++) {
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

    /**
     * Starts the game timer
     */
    startTimer() {
        if (this.gameTimer) return; // Timer already running
        
        this.gameStartTime = Date.now();
        this.gameTimer = setInterval(() => {
            this.gameTimeElapsed = Math.floor((Date.now() - this.gameStartTime) / 1000);
            UI.updateTimerDisplay(this.gameTimeElapsed);
        }, 1000); // Update every second
    }

    /**
     * Stops the game timer
     */
    stopTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }

    /**
     * Gets the current game time in seconds
     * @returns {number} The elapsed time in seconds
     */
    getGameTime() {
        return this.gameTimeElapsed;
    }
}
