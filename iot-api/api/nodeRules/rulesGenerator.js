var RuleEngine = require("node-rules");

class RulesEngineInitializer {
    constructor(){
        this.rules=[];
    }

    initGeneralRules() {
        
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
                R.when(this.displays && this.displays.length <= 0);
            },
            "consequence": function(R) {
                this.result = false;
                this.reason = "The event doesn\'t have displays";
                this.reason += "\n name : " + this.name + "\n id : " + this._id + "\n";
                R.stop();
            }
        };
        this.rules.push(ruleIsEnabled, ruleHasDisplays);       
    }

    initEventTimeRules() {
        
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

        let ruleOnTimeCron= {
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
        
        this.rules.push(ruleType, ruleOnTimeCron);       
    }

    initEventActionRules(){

        let ruleType= {
            "name": "event type detector",
            "priority": 80,
            "on" : true,
            "condition" : function(R) {
                R.when(this.type === 'action');
            },
            "consequence": function(R) {
                this.result = true;
                this.actionDetected = true;
                R.next();
            }
        };


        let ruleActionPeople= {
            "name": "event type action",
            "priority": 80,
            "on" : true,
            "condition" : function(R) {
                R.when(this.configData[0].actionData.trigger === 'peopleCapacitySensor');
            },
            "consequence": function(R) {
                this.result = false;
                this.updateDisplays = true;
                this.reason = "Lanzaria trigger para actualizar pantallas \n";
                this.reason += "name : " + this.name + "\n";
                this.reason += "id : " + this._id + "\n";
                this.reason += "type :" + this.type + "\n";
                R.stop();
            }
        };
        this.rules.push(ruleType, ruleActionPeople);       
    }
    
    registerRules(ruleEngine) {
        this.rules.forEach(rule => {
            ruleEngine.register(rule);
        });
        return ruleEngine;
    }

}
module.exports  = RulesEngineInitializer; 