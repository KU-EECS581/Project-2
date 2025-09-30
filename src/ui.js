/**
 * Name: ui.js
 * Description: Handles all UI related functions and elements.
 * Original Author(s): Evan Zhuo, Ian Foerwiser, Jack Morice, Zhang Chen, Alex Carillo
 * Revision Author(s): Riley Meyerkorth
 * Inputs: N/A
 * Outputs: N/A
 * Dependencies: constants.js
 * Date Revised: 09 September 2025
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
     * Handles changes to the AI checkbox.
     * Disables/enables the AI difficulty dropdown based on checkbox state.
     * @param {*} event 
     * @return {boolean} The current state of the checkbox (checked or not)
     */
    handleEnabledAICheckboxChanged() {
        const isChecked = this.checkboxEnableAI.checked;
        this.dropdownDifficultyAI.disabled = !isChecked;

        return isChecked;
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
