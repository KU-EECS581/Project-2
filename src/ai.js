/**
 * Name: ai.js
 * Description: Contains all the JavaScript code for the AI player in the game of minesweeper.
 * Original Author(s): Riley Meyerkorth
 * Dependencies: constants.js utils.js game.js ui.js
 * Date Revised: 30 September 2025
 */

class AI {
    /**
     * Creates an instance of the AI player.
     * @param {Game} game 
     * @param {number} difficulty The difficulty level of the AI in the "enum" difficulty type
     */
    constructor(game, difficulty) {
        this.game = game;
        this.difficulty = difficulty;
        this.isEnabled = false; // AI is disabled by default
    }

    /**
     * Toggles the AI bot on or off.
     */
    toggle() {
        this.isEnabled = UI.handleEnabledAICheckboxChanged();
    }

    /**
     * Updates the AI difficulty based on UI selections.
     */
    updateDifficulty() {
        if (!UI.checkboxEnableAI.checked) {
            this.difficulty = DIFFICULTY_NONE;
            return;
        }

        // Convert dropdown value to number and add debugging
        const dropdownValue = UI.dropdownDifficultyAI.value;
        const numericValue = parseInt(dropdownValue);
        console.log(`AI: Dropdown value: "${dropdownValue}" (type: ${typeof dropdownValue}), parsed: ${numericValue}`);

        // Switch case to set the difficulty based on dropdown value
        switch (numericValue) {
            case DIFFICULTY_EASY:
                this.difficulty = DIFFICULTY_EASY;
                console.log("AI: Set difficulty to EASY");
                break;
            case DIFFICULTY_MEDIUM:
                this.difficulty = DIFFICULTY_MEDIUM;
                console.log("AI: Set difficulty to MEDIUM");
                break;
            case DIFFICULTY_HARD:
                this.difficulty = DIFFICULTY_HARD;
                console.log("AI: Set difficulty to HARD");
                break;
            default:
                console.warn(`AI: Unknown difficulty value: ${dropdownValue}, defaulting to EASY`);
                this.difficulty = DIFFICULTY_EASY;
                break;
        }
    }

    /**
     * Makes a move for the AI player.
     */
    makeMove() {
        // Update AI enabled state and difficulty when making a move
        this.isEnabled = UI.checkboxEnableAI.checked;
        this.updateDifficulty();
        
        // AI logic to make a move
        if (!this.isEnabled || this.game.state !== STATE_ACTIVE_GAME) return;

        console.log(`AI: Making move at difficulty ${this.difficulty}`);

        switch (this.difficulty) {
            case DIFFICULTY_EASY:
                this._easyMove();
                break;
            case DIFFICULTY_MEDIUM:
                this._mediumMove();
                break;
            case DIFFICULTY_HARD:
                this._hardMove();
                break;
            default:
                // Default to easy move if no valid difficulty
                this._easyMove();
                break;
        }
    }

    /**
     * Private method for easy difficulty move
     */
    _easyMove() {
        // Ask the game object for all tiles that are still hidden and not flagged
        const candidates = this.game.getAvailableTiles();

        // If there are no valid moves left, exit
        if (!Array.isArray(candidates) || candidates.length === 0) {
            console.warn("AI(Easy): No available moves");
            return;
        }

        // Pick a random index within the candidates array
        const idx = Math.floor(Math.random() * candidates.length);

        // Grab the tiel object that is at the index
        const tile = candidates[idx];

        // MAke a left click on the tile
        this._makeLeftClick(tile);
    }

    /**
     * Private method for medium difficulty move
     * Implements the following rules:
     * 1. If # of adjacent hidden cells == # of cell (minus flags), flag all those hidden adjacent cells
     * 2. If # of flagged adjacent cells equals a cell's number, open all other hidden neighbors
     * 3. Otherwise, pick a random unflagged hidden cell (fallback to easy AI)
     */
    _mediumMove() {
        console.log("AI: Making medium difficulty move...");
        
        // Iterate through all tiles looking for revealed numbered tiles
        for (let i = 0; i < this.game.boardSize; i++) {
            const tile = document.getElementById("msTile-" + i);
            
            // Convert tile.value to number (in case it's stored as string)
            const tileValue = parseInt(tile.value) || 0;
            
            // Skip if not a revealed numbered tile
            if (!tile || !tile.revealed || tile.bomb || tileValue === 0) continue;
            
            // Debug logging to see what we're working with
            console.log(`AI: Examining tile ${i} - value: "${tile.value}" (type: ${typeof tile.value}), parsed: ${tileValue}`);
            
            // Get all neighbors of this numbered tile
            const neighbors = this.game.getAdjacentTiles(tile);
            
            // Categorize the neighbors
            const flaggedNeighbors = neighbors.filter(n => n.flagged);
            const hiddenNeighbors = neighbors.filter(n => !n.revealed && !n.flagged);
            
            const flaggedCount = flaggedNeighbors.length;
            const hiddenCount = hiddenNeighbors.length;
            const remainingBombs = tileValue - flaggedCount;
                        
            // Rule 1: If # of adjacent hidden cells == # of cell (minus flags), flag all those hidden adjacent cells
            if (hiddenCount === remainingBombs && remainingBombs > 0) {
                console.log(`AI: Rule 1 - Flagging ${hiddenCount} hidden neighbors of tile ${i}`);
                this._makeRightClick(hiddenNeighbors[0]);
                return; // Make one move at a time
            }
            
            // Rule 2: If # of flagged adjacent cells equals a cell's number, open all other hidden neighbors
            if (flaggedCount === tileValue && hiddenCount > 0) {
                console.log(`AI: Rule 2 - Opening ${hiddenCount} safe neighbors of tile ${i} (tile value: ${tileValue})`);
                this._makeLeftClick(hiddenNeighbors[0]);
                return; // Make one move at a time
            }
        }
        
        // Rule 3: No smart moves found, fall back to easy AI (random move)
        console.log("AI: No smart moves found, making random move");
        this._easyMove();
    }

    /**
     * Private method for hard difficulty move
     */
    _hardMove() {
        // TODO: Hard difficulty AI logic (ensure all requirements are met)
        // For now, make a simple random move on an unrevealed, unflagged tile
        this._makeRandomMove();
    }

    /**
     * Helper method to make a random move (placeholder implementation)
     * This is a basic implementation for your teammates to improve upon
     */
    _makeRandomMove() {
        const availableTiles = this.game.getAvailableTiles();
        
        if (availableTiles.length === 0) {
            console.warn("AI: No available moves");
            return;
        }

        // Pick a random tile from available tiles
        const randomIndex = Math.floor(Math.random() * availableTiles.length);
        const selectedTile = availableTiles[randomIndex];
        
        // Randomly decide between left click (reveal) or right click (flag)
        const action = Math.random() < 0.8 ? 'reveal' : 'flag'; // 80% chance to reveal, 20% to flag
        
        if (action === 'reveal') {
            this._makeLeftClick(selectedTile);
        } else {
            this._makeRightClick(selectedTile);
        }
    }

    /**
     * Helper method to simulate a left click on a tile (for AI moves)
     * @param {*} tile The tile to click
     */
    _makeLeftClick(tile) {
        this.game.makeAILeftClick(tile);
    }

    /**
     * Helper method to simulate a right click on a tile (for AI moves)
     * @param {*} tile The tile to flag/unflag
     */
    _makeRightClick(tile) {
        this.game.makeAIRightClick(tile);
    }
}
