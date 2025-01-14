/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class SimpleItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["mistborn", "sheet", "prop"],
      template: "systems/mistborn/templates/item-sheet.html",
      width: 520,
      height: 480,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
      scrollY: [".attributes"],
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    data.system = this.item.system;
    return data;
  }

  /* -------------------------------------------- */

  /** @override */
	activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

  
  }

  /* -------------------------------------------- */

  /** @override */
  _updateObject(event, formData) {
    
    // Update the Actor with the new form values.
    return this.object.update(formData);
  }
}
