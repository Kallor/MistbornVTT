import { EntitySheetHelper } from "./helper.js";
import { MistRoll } from "./mist-roll.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class MistbornActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["mistborn", "sheet", "actor"],
      template: "systems/mistborn/templates/actor-sheet.html",
      width: 850,
      height: 650,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
      scrollY: [".biography", ".items", ".attributes"],
      dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();    
    return data;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if ( !this.options.editable ) return;

    // Handle rollable items and attributes
    html.find(".rollable").on("click", this._onRoll.bind(this));
   
    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteOwnedItem(li.data("itemId"));
      li.slideUp(200, () => this.render(false));
    });

    // Add draggable for macros.
    html.find(".attributes a.attribute-roll").each((i, a) => {
      a.setAttribute("draggable", true);
      a.addEventListener("dragstart", ev => {
        let dragData = ev.currentTarget.dataset;
        ev.dataTransfer.setData('text/plain', JSON.stringify(dragData));
      }, false);
    });
   
  }

  async _onRoll(event) {
    let elem = $(event.currentTarget);
    const dice = elem.data('dice')
    const dialogContent = await renderTemplate("systems/mistborn/templates/chat/roll-dialog.hbs", {});

    const d = new Dialog({
          title: `Roll ${dice} dices`,
          content: dialogContent,
          buttons: {
              no: {
                  label: "Cancel", callback: () => {                      
                  }
              },
              yes: { label: "Roll", callback: html => { 
                  const diceBonus = html.find("#diceBonus").val();
                  const freeNudges = html.find("#freeNudges").val();
                   //let r = new Roll(button.data('roll'), this.actor.getRollData());
                  let roll = new MistRoll(`${dice}+${diceBonus}.${freeNudges}`);
                  roll.roll(this);
              } }
          },
          close: ()=>{             
          },
          default: 'yes'
      });     
      d.render(true);
  }

  /* -------------------------------------------- */

  /**
   * Listen for roll buttons on items.
   * @param {MouseEvent} event    The originating left click event
   */
  _onItemRoll(event) {
    let button = $(event.currentTarget);
    let r = new Roll(button.data('roll'), this.actor.getRollData());
    const li = button.parents(".item");
    const item = this.actor.getOwnedItem(li.data("itemId"));
    r.roll().toMessage({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `<h2>${item.name}</h2><h3>${button.text()}</h3>`
    });
  }

  /* -------------------------------------------- */

  /** @override */
  _updateObject(event, formData) {

    return this.object.update(formData);
  }

}
