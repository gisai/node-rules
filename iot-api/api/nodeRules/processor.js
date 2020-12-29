
class nodeRuleProcessor {

    constructor(name) {
        this.name = name;
    }
    processNodeRules (event, RuleEngine) {
        event.displays = [1,2,3]; //For testing
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