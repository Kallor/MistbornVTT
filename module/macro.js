/**
 * Create a Macro from an attribute drop.
 * Get an existing mistborn macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
export async function createmistbornMacro(data, slot) {
  const command = `const roll = new Roll("${system.roll}", actor ? actor.getRollData() : {});
  roll.toMessage({speaker, flavor: "${system.label}"});`;
  let macro = game.macros.entities.find(m => (m.name === item.label) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: system.label,
      type: "script",
      command: command,
      flags: { "mistborn.attrMacro": true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}
