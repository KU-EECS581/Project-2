/**
 * Name: constants.js
 * Description: Contains all constants used in the game. Also contains "enums" for states, themes, end game conditions, and errors. (JavaScript doesn't have native enum support.)
 * Original Author(s): Riley Meyerkorth
 * Inputs: N/A
 * Outputs: N/A
 * Dependencies: N/A
 * Date Created: 09 September 2025
 */

const MIN_BOMBS = 10; // Minimum number of bombs allowed
const MAX_BOMBS = 20; // Maximum number of bombs allowed
const ALPHABET = "abcdefghijklmnopqrstuvwxyz".toUpperCase(); // The alphabet in uppercase
const HORSE_IMAGE_PATH = '../assets/images/horse.webp'; // Path to the horse image

// State "Enum"
const STATE_MAIN_MENU = 0; // Main Menu State
const STATE_ACTIVE_GAME = 1; // Active Game State
const STATE_GAME_OVER = 2; // Game Over State
const STATE_OPTIONS = 3; // Options Menu State
const STATE_CREDITS = 4; // Credits Menu State

// Theme "Enum"
const THEME_DEFAULT = 0; // Default Theme
const THEME_DARK = 1; // Dark Theme
const THEME_CLASSIC = 2; // Classic Theme

// End Game Condition "Enum"
const END_WIN = 1; // Win Condition
const END_LOSE = 2; // Lose Condition

// AI Difficulty "Enum"
const DIFFICULTY_NONE = -1; // No AI
const DIFFICULTY_EASY = 0; // Easy Difficulty
const DIFFICULTY_MEDIUM = 1; // Medium Difficulty
const DIFFICULTY_HARD = 2; // Hard Difficulty

// Error "Enum"
const ERROR_HORSE = 1; // Horse Error
const ERROR_UNKNOWN_END = 2; // Unknown End Condition Error

// No export needed - these are now global variables