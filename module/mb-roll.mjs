
/**
 * Post dice roll results to chat using a custom chat card.
 *
 * @param {Roll} roll - The roll object containing the roll data.
 * @param {object} options - Additional options for the chat message.
 */
async function postDiceRollToChat(roll, options) {
    // Prepare the data for the chat card template
    const templateData = {
        total: roll.total,
        formula: roll.formula,
        flavor: options.flavor || `Rolled ${roll.formula}`,
        speaker: options.speaker || ChatMessage.getSpeaker()
    };

    // Render the chat card template and create a chat message
    const content = await renderTemplate("systems/mistborn/templates/chat/mb-roll-card.hbs", templateData);
    ChatMessage.create({
        speaker: templateData.speaker,
        content: content
    });
}

/**
 * Roll a specified number of d6 dice.
 *
 * @param {number} numDice - The number of d6 dice to roll.
 * @param {object} [options={}] - Additional options for the roll.
 * @returns {Promise<Roll>} - The evaluated Roll object.
 */
export async function rollD6(numDice, options = {}) {
    const formula = `${numDice}d6`;
    const roll = new Roll(formula, options.data);

    // Evaluate the roll
    await roll.evaluate({async: true});

    // Prepare the data for the chat card template
    const templateData = {
        total: roll.total,
        formula: roll.formula,
        flavor: options.flavor || `Rolling ${numDice}d6...`,
        speaker: options.speaker || ChatMessage.getSpeaker()
    };

    // Render the chat card template and create a chat message
    const content = await renderTemplate("templates/mb-roll-card.hbs", templateData);
    ChatMessage.create({
        speaker: templateData.speaker,
        content: content
    });

    return roll;
}


/*
import { rollD6 } from './mb-roll.mjs';

// Roll 3d6
rollD6(3, {
    flavor: "Rolling for damage!",
    enhanced: false
});
*/