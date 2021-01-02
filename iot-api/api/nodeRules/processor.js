const RulesEngineInitializer = require('./rulesGenerator');
const RuleEngine = require("node-rules");

class nodeRuleProcessor {

    constructor(name) {
        this.name = name;
    }
    initRuleEngine(){
        var ruleEngine = new RuleEngine(),
        ruleEnegineInitialize = new RulesEngineInitializer();

        ruleEnegineInitialize.initRules();
        ruleEnegineInitialize.registerRules(ruleEngine);

        return ruleEngine;
    }
    processNodeRules (event) {
        var RuleEngine = this.initRuleEngine();
        event.displays = [
            {_id:2},
            {_id:3}
        ];
        RuleEngine.execute(event, function(data){
                if(!data.result) {
                    console.log(data.reason)
                    if (data.cleanDisplays) {
                        console.log("Limpiado de pantallas");
                        console.log(event.displays);
                    }
                }
            }.bind(this)) 
    }
    cleanNodeRules (task) {
        setTimeout(function(){

        },8000);
    }
}
module.exports  = nodeRuleProcessor;    