/**
 * Name: ai.js
 * Description: Contains all the JavaScript code for the AI player in the game of minesweeper.
 * Original Author(s): Riley Meyerkorth
 * Dependencies: constants.js utils.js game.js ui.js
 * Date Revised: 10 September 2025
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

        // Switch case to set the difficulty based on dropdown value
        switch (UI.dropdownDifficultyAI.value) {
            case DIFFICULTY_EASY:
                this.difficulty = DIFFICULTY_EASY;
                break;
            case DIFFICULTY_MEDIUM:
                this.difficulty = DIFFICULTY_MEDIUM;
                break;
            case DIFFICULTY_HARD:
                this.difficulty = DIFFICULTY_HARD;
                break;
        }
    }

    /**
     * Makes a move for the AI player.
     */
    makeMove() {
        // AI logic to make a move

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
        }
    }

    /**
     * Private method for easy difficulty move
     */
    _easyMove() {
        // TODO: Easy difficulty AI logic (ensure all requirements are met)
    }

    /**
     * Private method for medium difficulty move
     */
    _mediumMove() {
        // TODO: Medium difficulty AI logic (ensure all requirements are met)
    }

    /**
     * Private method for hard difficulty move
     */
    _hardMove() {
        // TODO: Hard difficulty AI logic (ensure all requirements are met)
    }
}
