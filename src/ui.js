/**
 * Name: ui.js
 * Description: Handles all UI related functions and elements.
 * Original Author(s): Evan Zhuo, Ian Foerwiser, Jack Morice, Zhang Chen, Alex Carillo
 * Revision Author(s): Riley Meyerkorth
 * Inputs: N/A
 * Outputs: N/A
 * Dependencies: constants.js
 * Date Revised: 29 September 2025
 */

/**
 * Added by RM to handle all UI related functions and elements.
 * A "singleton".
 */
class UIManager {
    // Menu Elements
    // Each menu corresponds to its div in the index.html file
    pageMain = document.getElementById("pageMain");
    pageGame = document.getElementById("pageGame");
    pageOptions = document.getElementById("pageOptions");
    pageCredits = document.getElementById("pageCredits");
    pagePreGame = document.getElementById("pagePreGame");

    // Buttons
    // Each button corresponds to its element in the index.html file
    buttonPlay = document.getElementById("buttonPlay");
    buttonOption = document.getElementById("buttonOption");
    buttonCredit = document.getElementById("buttonCredit");
    buttonTheme = document.getElementById("buttonTheme");
    buttonStart = document.getElementById("buttonStart");
    buttonAutoSolve = document.getElementById("buttonAutoSolve");
    buttonReset = document.getElementById("buttonReset");

    // Options elements
    checkboxEnableAI = document.getElementById("checkboxEnableAI");
    dropdownDifficultyAI = document.getElementById("dropdownDifficultyAI");

    // Setting Elements
    // Each element corresponds to its respective version in the index.html file
    board = document.getElementById("divBoard");
    bombAmountInput = document.getElementById("bombAmount");
    labelGameStatus = document.getElementById("labelGameStatus");
    msTiles = document.querySelectorAll("#msTile");
    labelMineNum = document.getElementById("labelMineNum");
    labelTimeNum = document.getElementById("labelTimeNum");

    // Theme
    currentTheme = THEME_DEFAULT;

    constructor() {
        // Initialize AI checkbox to unchecked state
        this.checkboxEnableAI.checked = false;
        this.buttonAutoSolve.checked = false;
    }
    
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
     * Disables the solve button
     */
    disableSolveButton() {
        this.buttonAutoSolve.disabled = true;
    }

    /**
     * Enables the solve button
     */
    enableSolveButton() {
        this.buttonAutoSolve.disabled = false;
    }

    /**
     * Handles changes to the AI checkbox.
     * Disables/enables the AI difficulty dropdown based on checkbox state.
     * @param {*} event 
     * @return {boolean} The current state of the checkbox (checked or not)
     */
    handleEnabledAICheckboxChanged() {
        const isChecked = this.checkboxEnableAI.checked;
        this.dropdownDifficultyAI.disabled = !isChecked;
        this.buttonAutoSolve.disabled = !isChecked; // Disable solve button if AI is not enabled
        this.buttonStart.textContent = isChecked ? "Start (versus AI)" : "Start";

        return isChecked;
    }

    /**
     * Disables the AI difficulty dropdown
     */
    disableDifficultyDropdown() {
        this.dropdownDifficultyAI.disabled = true;
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
     * Updates the timer display
     * @param {number} timeInSeconds The time elapsed in seconds
     */
    updateTimerDisplay(timeInSeconds) {
        if (this.labelTimeNum) {
            // Format time as minutes and seconds
            const minutes = Math.floor(timeInSeconds / 60);
            const seconds = timeInSeconds % 60;
            
            if (minutes > 0) {
                this.labelTimeNum.innerHTML = `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
            } else {
                this.labelTimeNum.innerHTML = `${seconds}s`;
            }
        }
    }

    /**
     * Updates the game status with turn information (for turn-based mode)
     * @param {boolean} isTurnBased Whether the game is in turn-based mode
     * @param {number} currentTurn The current turn (TURN_PLAYER or TURN_AI)
     * @param {number} remainingBombs Number of bombs remaining
     */
    updateTurnDisplay(isTurnBased, currentTurn, remainingBombs) {
        if (!isTurnBased) {
            this.setGameStatus(`Game in progress - ${remainingBombs} bombs remaining`);
            return;
        }
        
        const turnMessage = currentTurn === TURN_PLAYER ? "Your Turn" : "AI's Turn";
        this.setGameStatus(`${turnMessage} - ${remainingBombs} bombs remaining`);
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
        this.buttonStart.remove();
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

// Singleton Instance
const UI = new UIManager();
