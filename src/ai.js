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
     * Implements the following rules:
     * 1. If # of adjacent hidden cells == # of cell (minus flags), flag all those hidden adjacent cells
     * 2. If # of flagged adjacent cells equals a cell's number, open all other hidden neighbors  
     * 3. 1-2-1 pattern rule: If three side-by-side revealed cells show "1-2-1," flag outer neighbors and open inner neighbor
     * 4. Otherwise, pick a random unflagged hidden cell (fallback to easy AI)
     */
    _hardMove() {
        console.log("AI: Making hard difficulty move...");
        
        // Rules 1 & 2: Try medium difficulty rules first
        // Iterate through all tiles looking for revealed numbered tiles
        for (let i = 0; i < this.game.boardSize; i++) {
            const tile = document.getElementById("msTile-" + i);
            
            // Convert tile.value to number (in case it's stored as string)
            const tileValue = parseInt(tile.value) || 0;
            
            // Skip if not a revealed numbered tile
            if (!tile || !tile.revealed || tile.bomb || tileValue === 0) continue;
            
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
                console.log(`AI: Hard Rule 1 - Flagging ${hiddenCount} hidden neighbors of tile ${i}`);
                this._makeRightClick(hiddenNeighbors[0]);
                return; // Make one move at a time
            }
            
            // Rule 2: If # of flagged adjacent cells equals a cell's number, open all other hidden neighbors
            if (flaggedCount === tileValue && hiddenCount > 0) {
                console.log(`AI: Hard Rule 2 - Opening ${hiddenCount} safe neighbors of tile ${i} (tile value: ${tileValue})`);
                this._makeLeftClick(hiddenNeighbors[0]);
                return; // Make one move at a time
            }
        }
        
        // Rule 3: Check for 1-2-1 patterns
        if (this._try121Pattern()) {
            return; // Found a move using 1-2-1 pattern
        }
        
        // Rule 4: No smart moves found, fall back to easy AI (random move)
        console.log("AI: No smart moves found, making random move");
        this._easyMove();
    }

    /**
     * Helper method to detect and act on 1-2-1 patterns
     * @returns {boolean} true if a move was made, false otherwise
     */
    _try121Pattern() {
        // Check horizontal 1-2-1 patterns
        if (this._checkHorizontal121()) return true;
        
        // Check vertical 1-2-1 patterns  
        if (this._checkVertical121()) return true;
        
        return false; // No 1-2-1 pattern found
    }

    /**
     * Check for horizontal 1-2-1 patterns
     * @returns {boolean} true if a move was made, false otherwise
     */
    _checkHorizontal121() {
        for (let row = 0; row < ROW_COUNT; row++) {
            for (let col = 0; col < ROW_COUNT - 2; col++) { // -2 because we need 3 consecutive tiles
                const leftIndex = row * ROW_COUNT + col;
                const centerIndex = row * ROW_COUNT + col + 1;
                const rightIndex = row * ROW_COUNT + col + 2;
                
                const leftTile = document.getElementById("msTile-" + leftIndex);
                const centerTile = document.getElementById("msTile-" + centerIndex);
                const rightTile = document.getElementById("msTile-" + rightIndex);
                
                // Check if we have a 1-2-1 pattern
                if (this._is121Pattern(leftTile, centerTile, rightTile)) {
                    console.log(`AI: Found horizontal 1-2-1 pattern at tiles ${leftIndex}-${centerIndex}-${rightIndex}`);
                    return this._handle121Pattern(leftTile, centerTile, rightTile, 'horizontal');
                }
            }
        }
        return false;
    }

    /**
     * Check for vertical 1-2-1 patterns
     * @returns {boolean} true if a move was made, false otherwise
     */
    _checkVertical121() {
        for (let row = 0; row < ROW_COUNT - 2; row++) { // -2 because we need 3 consecutive tiles
            for (let col = 0; col < ROW_COUNT; col++) {
                const topIndex = row * ROW_COUNT + col;
                const centerIndex = (row + 1) * ROW_COUNT + col;
                const bottomIndex = (row + 2) * ROW_COUNT + col;
                
                const topTile = document.getElementById("msTile-" + topIndex);
                const centerTile = document.getElementById("msTile-" + centerIndex);
                const bottomTile = document.getElementById("msTile-" + bottomIndex);
                
                // Check if we have a 1-2-1 pattern
                if (this._is121Pattern(topTile, centerTile, bottomTile)) {
                    console.log(`AI: Found vertical 1-2-1 pattern at tiles ${topIndex}-${centerIndex}-${bottomIndex}`);
                    return this._handle121Pattern(topTile, centerTile, bottomTile, 'vertical');
                }
            }
        }
        return false;
    }

    /**
     * Check if three tiles form a valid 1-2-1 pattern
     * @param {HTMLElement} tile1 First tile
     * @param {HTMLElement} tile2 Center tile  
     * @param {HTMLElement} tile3 Third tile
     * @returns {boolean} true if it's a valid 1-2-1 pattern
     */
    _is121Pattern(tile1, tile2, tile3) {
        if (!tile1 || !tile2 || !tile3) return false;
        if (!tile1.revealed || !tile2.revealed || !tile3.revealed) return false;
        if (tile1.bomb || tile2.bomb || tile3.bomb) return false;
        
        const val1 = parseInt(tile1.value) || 0;
        const val2 = parseInt(tile2.value) || 0;
        const val3 = parseInt(tile3.value) || 0;
        
        return val1 === 1 && val2 === 2 && val3 === 1;
    }

    /**
     * Handle a detected 1-2-1 pattern by making appropriate moves
     * @param {HTMLElement} tile1 First tile
     * @param {HTMLElement} tile2 Center tile
     * @param {HTMLElement} tile3 Third tile
     * @param {string} direction 'horizontal' or 'vertical'
     * @returns {boolean} true if a move was made, false otherwise
     */
    _handle121Pattern(tile1, tile2, tile3, direction) {
        // Get neighbors of center tile
        const centerNeighbors = this.game.getAdjacentTiles(tile2);
        
        // Find the neighbors that are on the outer sides of the pattern
        const tile1Index = parseInt(tile1.id.split('-')[1]);
        const tile3Index = parseInt(tile3.id.split('-')[1]);
        
        // Find outer neighbors (neighbors of the center that are beyond tile1 and tile3)
        let outerNeighbors = [];
        let innerNeighbor = null;
        
        if (direction === 'horizontal') {
            // For horizontal pattern, outer neighbors are left of tile1 and right of tile3
            outerNeighbors = centerNeighbors.filter(neighbor => {
                const neighborIndex = parseInt(neighbor.id.split('-')[1]);
                const neighborCol = neighborIndex % ROW_COUNT;
                const tile1Col = tile1Index % ROW_COUNT;
                const tile3Col = tile3Index % ROW_COUNT;
                
                return (neighborCol === tile1Col - 1 || neighborCol === tile3Col + 1) && 
                       Math.floor(neighborIndex / ROW_COUNT) === Math.floor(tile2.id.split('-')[1] / ROW_COUNT);
            });
            
            // Inner neighbor would be above or below the center
            const centerRow = Math.floor(parseInt(tile2.id.split('-')[1]) / ROW_COUNT);
            innerNeighbor = centerNeighbors.find(neighbor => {
                const neighborIndex = parseInt(neighbor.id.split('-')[1]);
                const neighborRow = Math.floor(neighborIndex / ROW_COUNT);
                const neighborCol = neighborIndex % ROW_COUNT;
                const centerCol = parseInt(tile2.id.split('-')[1]) % ROW_COUNT;
                
                return neighborCol === centerCol && (neighborRow === centerRow - 1 || neighborRow === centerRow + 1);
            });
        } else {
            // For vertical pattern, outer neighbors are above tile1 and below tile3
            outerNeighbors = centerNeighbors.filter(neighbor => {
                const neighborIndex = parseInt(neighbor.id.split('-')[1]);
                const neighborRow = Math.floor(neighborIndex / ROW_COUNT);
                const tile1Row = Math.floor(tile1Index / ROW_COUNT);
                const tile3Row = Math.floor(tile3Index / ROW_COUNT);
                const centerCol = parseInt(tile2.id.split('-')[1]) % ROW_COUNT;
                
                return (neighborRow === tile1Row - 1 || neighborRow === tile3Row + 1) && 
                       neighborIndex % ROW_COUNT === centerCol;
            });
            
            // Inner neighbor would be left or right of the center
            const centerCol = parseInt(tile2.id.split('-')[1]) % ROW_COUNT;
            innerNeighbor = centerNeighbors.find(neighbor => {
                const neighborIndex = parseInt(neighbor.id.split('-')[1]);
                const neighborRow = Math.floor(neighborIndex / ROW_COUNT);
                const neighborCol = neighborIndex % ROW_COUNT;
                const centerRow = Math.floor(parseInt(tile2.id.split('-')[1]) / ROW_COUNT);
                
                return neighborRow === centerRow && (neighborCol === centerCol - 1 || neighborCol === centerCol + 1);
            });
        }
        
        // Flag outer neighbors if they're hidden
        for (const outerNeighbor of outerNeighbors) {
            if (!outerNeighbor.revealed && !outerNeighbor.flagged) {
                console.log(`AI: 1-2-1 Pattern - Flagging outer neighbor at index ${parseInt(outerNeighbor.id.split('-')[1])}`);
                this._makeRightClick(outerNeighbor);
                return true; // Made a move
            }
        }
        
        // Open inner neighbor if it's hidden
        if (innerNeighbor && !innerNeighbor.revealed && !innerNeighbor.flagged) {
            console.log(`AI: 1-2-1 Pattern - Opening safe inner neighbor at index ${parseInt(innerNeighbor.id.split('-')[1])}`);
            this._makeLeftClick(innerNeighbor);
            return true; // Made a move
        }
        
        return false; // No move made (pattern already handled)
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
