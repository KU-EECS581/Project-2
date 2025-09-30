/**
 * Name: app.js
 * Description: Handles all application logic and state management. Is the main entry point for the game and menu control.
 * Original Author(s): Riley Meyerkorth
 * Inputs: N/A
 * Outputs: N/A
 * Dependencies: constants.js ui.js game.js
 * Date Created: 09 September 2025
 */

/**
 * The main application class that handles game state and menu navigation.
 */
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
     * Basically a wrapper for UI.changeTheme() so that the index can call it.
     */
    changeTheme() {
        UI.changeTheme();
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

const APP = new App(); // "Singleton" instance of App