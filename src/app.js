/**
 * Name: app.js
 * Description: Handles all application logic and state management. Is the main entry point for the game and menu control.
 * Original Author(s): Riley Meyerkorth
 * Inputs: N/A
 * Outputs: N/A
 * Dependencies: constants.js ui.js game.js
 * Date Created: 29 September 2025
 */

/**
 * The main application class that handles game state and menu navigation.
 */
class App {
    game = new Game(); // The game instance
    ai = new AI(this.game, DIFFICULTY_NONE); // The AI bot instance

    /**
     * Initializes the application.
     * Primarily checks if the horse image loads correctly.
     */
    init() { 
        var horse = new Image();
        horse.src = HORSE_IMAGE_PATH;
        if (horse.width == 0) {
            UI.errorPage(ERROR_HORSE);
            return;
        }
        
        // Start at the main menu
        this.navigate(PAGE_MAIN);
    }

    /**
     * Sets the game options based on UI inputs.
     * @returns True if game options are set correctly, false otherwise
     */
    _handleSetGameOptions() {
        let bombValue = UI.bombAmountInput.value; // Get the value of the bomb amount input
        if (bombValue < MIN_BOMBS || bombValue > MAX_BOMBS) { // Check if the bomb amount is out of range
            alert(`Please select a bomb value between ${MIN_BOMBS} and ${MAX_BOMBS}.`); // Alert the user
            UI.disablePlayButton();
            UI.setGameStatus(`Please select a bomb value between ${MIN_BOMBS} and ${MAX_BOMBS}.`); // Update the notification
            return false; // Exit the function if the bomb amount is invalid
        }

        // Zhang: Add a check to ensure bomb amount is within requirement
        UI.enablePlayButton(); // Enable Play Button
        UI.bombAmountInput.style.display = 'none'; // Hide the bomb input
        UI.buttonStart.style.display = 'none'; // Hide the start button

        // Initialize AI state properly when starting the game
        this.ai.isEnabled = UI.checkboxEnableAI.checked;
        this.ai.updateDifficulty();

        // Register AI turn callback for proper separation of concerns
        this.game.setAITurnCallback(() => {
            this.ai.makeMove();
        });

        return true; // Return true if the bomb amount is valid
    }

    /**
     * Starts the start button being clicked
     * @returns {void}
     */
    handleStartClicked() {
        if (!this._handleSetGameOptions()) return; // Set game options
        
        this.game.startGame(); // Start the game
    }

    handleAutoSolveClicked() {
        if (!this._handleSetGameOptions()) return; // Set game options

        this.game.autoSolve(); // Auto-solve the game
    }

    /**
     * Navigates to the specified page.
     * @param {number} page The page to navigate to (from the PAGE "enum")
     */
    navigate(page) {
        switch(page) {
            case PAGE_OPTION:
                this._loadOption();
                break;
            case PAGE_CREDIT:
                this._loadCredit();
                break;
            case PAGE_GAME:
            case PAGE_PREGAME:
                this._loadGame();
                break;
            case PAGE_MAIN:
            default:
                this._loadMain();
                break;
        }
    }

    /**
     * Loads the options menu
     */
    _loadOption() {
        this.game.state = STATE_OPTIONS; // Set the state to Options

        // Hide all unimportant menus, show only options
        UI.pageMain.style.display = 'none'; 
        UI.pageGame.style.display = 'none';
        UI.pageOptions.style.display = 'block';
        UI.pageCredits.style.display = 'none';
        UI.pagePreGame.style.display = 'none';
        UI.setGameStatus(''); // Clear the labelGameStatus
    }

    /**
     * Loads the credits menu
     */
    _loadCredit() {
        this.game.state = STATE_CREDITS; //Set the state to Credits

        //Hide all unimportant menus, show only credits
        UI.pageMain.style.display = 'none';
        UI.pageGame.style.display = 'none';
        UI.pageOptions.style.display = 'none';
        UI.pageCredits.style.display = 'block';
        UI.pagePreGame.style.display = 'none';
        UI.setGameStatus(''); //Clear the labelGameStatus
    }

    /**
     * Loads the game page and shows the pregame menu
     */
    _loadGame() {
        //Load the game page and show only the pregame menu
        UI.pageMain.style.display = 'none';
        UI.pageOptions.style.display = 'none';
        UI.pageCredits.style.display = 'none';
        UI.pagePreGame.style.display = 'block';
        UI.setGameStatus(""); //Clear the notification
    }

    /**
     * Returns to the main menu
     */
    _loadMain() {
        this.game.state = STATE_MAIN_MENU; //Set the state to Main Menu

        //Hide all unimportant menus, go back to main menu
        UI.pageMain.style.display = 'block';
        UI.pageGame.style.display = 'none';
        UI.pageOptions.style.display = 'none';
        UI.pageCredits.style.display = 'none';
        UI.pagePreGame.style.display = 'none';

        UI.setGameStatus(''); //Clear the labelGameStatus
    }

    /**
     * Resets the app to its initial state.
     * Just a wrapper for reloading the page.
     */
    reset() {
        UI.disableSolveButton();
        UI.disableDifficultyDropdown();
        window.location.reload() //Reload the page
    }
    
}

const APP = new App(); // "Singleton" instance of App