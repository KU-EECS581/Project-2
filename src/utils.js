/**
 * Name: utils.js
 * Description: Contains utility functions for the game.
 * Original Author(s): Riley Meyerkorth
 * Inputs: N/A
 * Outputs: N/A
 * Dependencies: N/A
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