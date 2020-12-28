

class nodeRuleProcessor {

    constructor(name) {
        this.name = name;
        console.log(name);
    }
    processNodeRules (events) {
        console.log(events);
    }
}

module.exports  = nodeRuleProcessor;    