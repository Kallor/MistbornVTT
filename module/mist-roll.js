export class MistRoll{
    constructor(formula){
        let rollRegExp = /^(.+?(?=\.|$))(?:\.(.*))?/g;
    
        let m;

        while ((m = rollRegExp.exec(formula)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === rollRegExp.lastIndex) {
                rollRegExp.lastIndex++;
            }
            
            // The result can be accessed through the `m`-variable.
            m.forEach((match, groupIndex) => {
                if(groupIndex == 1 && match){
                   this._rollFormula = match;
                }
                if(groupIndex==2 && match){
                    this._nudgesFormula = match
                }            
            });
        }
     
    }

    async roll(actor) {
        if (!actor) {
            actor = { system: {} };
        }
        
        // Evaluate the primary roll
        const roll = new Roll(`(${this._rollFormula})d6`, actor.system);
        await roll.evaluate({ async: true });

        // Process the roll results
        this._processRollResults(roll);

        // Process nudges, if applicable
        if (this._nudgesFormula) {
            const nRoll = new Roll(this._nudgesFormula, actor.system);
            await nRoll.evaluate({ async: true });
            this._nudges = nRoll.total; // Use total for evaluated result
        }

        // Log and create a chat message
        console.log(`${this._result}.${this._nudges}`);
        console.log(this._results);
        await this.toMessage(actor);
    }

    _processRollResults(roll) {
        if (!roll.dice.length) {
            console.error("No dice results found.");
            return;
        }

        this._results = roll.dice[0].results;
        this._results.sort((r1, r2) => r2.result - r1.result);

        this._nudges = 0;
        this._nbDices = this._results.length - 1;

        let prevResult = 0;
        this._result = 0;
        for (let i = 0; i < this._results.length; i++) {
            const element = this._results[i];
            if (element.result == 6) {
                this._nudges++;
            } else if (prevResult === element.result) {
                this._result = prevResult;
                break;
            } else {
                prevResult = element.result;
            }
        }
    }

    async toMessage(actor) {
        const rollOptionTpl = 'systems/mistborn/templates/chat/roll-card.hbs';
        const rollOptionContent = await renderTemplate(rollOptionTpl, this);
    
        // Prepare chat data
        let messageData = {
            user: game.user.id, // Updated to use 'id' instead of '_id'
            content: rollOptionContent,
            speaker: ChatMessage.getSpeaker({ actor }),
            type: CONST.CHAT_MESSAGE_TYPES.ROLL
        };
    
        // Create and send the chat message
        await ChatMessage.create(messageData);
    }    

}
