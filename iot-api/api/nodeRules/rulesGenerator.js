var RuleEngine = require("node-rules");

class RulesEngineInitializer {
    constructor(){
        this.rules=[];
    }

    initRules() {
        let ruleIsEnabled = {
            "name": "event enabled",
            "priority": 100,
            "on" : true,
            "condition": function(R) {
                R.when(this.enabled === false);
            },
            "consequence": function(R) {
                this.result = false;
                this.reason = "The event is disabled"
                this.reason += "\n name : " + this.name + "\n id : " + this._id + "\n";
                R.stop();
            }
        };
        let ruleHasDisplays = {
            "name": "event with displays",
            "priority": 90,
            "on" : true,
            "condition" : function(R) {
                R.when(this.displays.length <= 0);
            },
            "consequence": function(R) {
                this.result = false;
                this.reason = "The event doesn\'t have displays";
                this.reason += "\n name : " + this.name + "\n id : " + this._id + "\n";
                R.stop();
            }
        };

        let ruleType= {
            "name": "event type detector",
            "priority": 80,
            "on" : true,
            "condition" : function(R) {
                R.when(this.type === 'time');
            },
            "consequence": function(R) {
                this.result = true;
                this.timeDetected = true;
                R.next();
            }
        };

        let ruleTimeCron= {
            "name": "event type time",
            "priority": 80,
            "on" : true,
            "condition" : function(R) {
                let actualDate = new Date(),
                    nextExecDate = new Date(this.configData[0].timeData.nextExecDate);
                R.when(actualDate >= nextExecDate  && this.timeDetected); //onTime validator
            },
            "consequence": function(R) {
                this.result = false;
                this.cleanDisplays = true;
                this.reason = "Ejecucion del evento: \n";
                this.reason += "name : " + this.name + "\n";
                this.reason += "id : " + this._id + "\n";
                this.reason += "type :" + this.type + "\n";
                R.stop();
            }
        };

        let ruleActionTrigger= {
            "name": "event type action",
            "priority": 80,
            "on" : true,
            "condition" : function(R) {
                R.when(this.name != '' && !this.timeDetected);
            },
            "consequence": function(R) {
                this.result = false;
                this.reason = "Lanzaria trigger para actualizar pantallas \n";
                this.reason += "name : " + this.name + "\n";
                this.reason += "id : " + this._id + "\n";
                this.reason += "type :" + this.type + "\n";
                R.stop();
            }
        };
        
        this.rules.push(ruleIsEnabled, ruleHasDisplays, ruleType, ruleTimeCron, ruleActionTrigger);       
    }
    
    registerRules(ruleEngine) {
        this.rules.forEach(rule => {
            ruleEngine.register(rule);
        });
        return ruleEngine;
    }

    validateDate(date){
        console.log(JSON.stringify(date));
    }
}
module.exports  = RulesEngineInitializer; 