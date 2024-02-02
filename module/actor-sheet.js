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
      scrollY: [".story", ".equipment"],
      dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    data.system = this.actor.system;
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
   
     // Delete Inventory Item
    html.find('.power-control').on('click', ev => {
      console.log("Add power button clicked");
      const li = $(ev.currentTarget).closest('.power-control');
      const action = li.data("action");
      let powers = Object.values(duplicate(this.object.system.powers));
      console.log("Powers before addition:", powers);
      switch(action){
        case "add":          
          powers.push({
              type:"a",
              metal:"",
              rating:0,
              charges:0,
              stunts:[
                  {
                      name:"",
                      effect:""
                  }
              ]
          });
          console.log("Powers after addition:", powers);    
          break;
        case "delete":{
            const index = li.data("index");
            powers.splice(index,1);
         }
          break;      
      }
      this._updateObject(ev,{system:{powers: powers}});
      
    });

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const id = li.data("itemId");
      this.actor.deleteOwnedItem(id);
      li.slideUp(200, () => this.render(false));
    });

    // // Add draggable for macros.
    // html.find(".attributes a.attribute-roll").each((i, a) => {
    //   a.setAttribute("draggable", true);
    //   a.addEventListener("dragstart", ev => {
    //     let dragData = ev.currentTarget.dataset;
    //     ev.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    //   }, false);
    // });
   
  }

  async _onRoll(event) {
    let elem = $(event.currentTarget);
    const dice = elem.system('dice')
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
                  let roll = new MistRoll(`${dice}+${diceBonus}.${freeNudges}`);
                  roll.roll(this.object.getRollData());
              } }
          },
          close: ()=>{             
          },
          default: 'yes'
      });     
      d.render(true);
  }


  /* -------------------------------------------- */

  /** @override */
  _updateObject(event, formData) {
    console.log("FormData before updating actor:", formData);
    this.object.update(formData).then(result => {
      console.log("Actor update successful:", result);
    }).catch(error => {
      console.error("Error updating actor:", error);
    });
  
    return this.object.update(formData);
  }

}
