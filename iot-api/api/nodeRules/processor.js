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
        event.displays = [1,2,3];
        RuleEngine.execute(event, function(data){
                if(!data.result) {
                    console.log(data.reason)
                } else {
                    if(data.timeDetected){
                        console.log("time")
                    }
                }
            }.bind(this)) 
        
    }
}
module.exports  = nodeRuleProcessor;    