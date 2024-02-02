import { MistRoll } from "./mist-roll.js";
import { Utils } from "./utils/utils.js";
import { rollD6 } from './mb-roll.mjs';

Hooks.on('chatMessage', (chatLog, messageText, chatData) => {
    if (messageText.startsWith("/mb") || messageText.startsWith("/mbroll")) {
        const parts = messageText.split(" ");
        let numDice = 1; // Default to 1 die if no number is provided

        if (parts.length > 1 && !isNaN(parts[1])) {
            numDice = parseInt(parts[1]);
        }

        // Call the dice roll function, which now handles chat message creation
        rollD6(numDice, { /* options, if any */ });

        return false; // Prevent default chat message processing
    }

    return true; // Allow normal processing for other messages
});




Hooks.on("chatMessage", (html, content, msg) => {
    // Define the regular expression to match the command
    const regExp = /^\/(m\s|mist\s)/;

    // Check if the command matches
    if (regExp.test(content)) {
        // Extract the command parameters after "/m" or "/mist"
        const command = content.replace(regExp, "").trim();

        // Create an instance of the MistRoll class and perform the roll
        const roll = new MistRoll(command); // Assuming command includes necessary parameters
        roll.roll(Utils.getSpeakersActor());

        return false; // Prevent default chat message processing
    }

    return true; // Allow normal processing for other messages
});
