/**
 * Name: utils.js
 * Description: Contains utility functions for the game.
 * Original Author(s): Riley Meyerkorth
 * Inputs: N/A
 * Outputs: N/A
 * Dependencies: constants.js
 * Date Created: 09 September 2025
 */

/**
 * Generates a random number between 0 and boardSize-1.
 * Revised by RM to fix passing errors.
 * @param {number} max The upper limit for the random number generation (exclusive)
 * @returns A random number between 0 and max-1
 */
function randomNumber(max) {
    let randomNum = Math.floor(Math.random() * max); // Generate a random number between 0 and max-1
    return randomNum; // Return the random number
}

/**
 * Converts a difficulty level to a string representation.
 * @param {number} difficulty 
 * @returns {string} The string representation of the difficulty level
 */
function difficultyToString(difficulty) {
    switch (difficulty) {
        case DIFFICULTY_EASY:
            return "Easy";
        case DIFFICULTY_MEDIUM:
            return "Medium";
        case DIFFICULTY_HARD:
            return "Hard";
        default:
            return "N/A";
    }
}