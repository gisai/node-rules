const RulesEngineInitializer = require('./rulesGenerator');
const RuleEngine = require("node-rules");
const mongoose = require('mongoose');

class nodeRuleProcessor {

    constructor(name) {
        this.name = name;
    }

    initRuleEngineEventTime(){
        var ruleEngine = new RuleEngine(),
            ruleEnegineInitialize = new RulesEngineInitializer();

        ruleEnegineInitialize.initGeneralRules();
        ruleEnegineInitialize.initEventTimeRules();
        ruleEnegineInitialize.registerRules(ruleEngine);

        return ruleEngine;
    }

    initRuleEngineEventAction(){
        var ruleEngine = new RuleEngine(),
            ruleEnegineInitialize = new RulesEngineInitializer();

        ruleEnegineInitialize.initGeneralRules();
        ruleEnegineInitialize.initEventActionRules();
        ruleEnegineInitialize.registerRules(ruleEngine);

        return ruleEngine;
    }

    processNodeRules (event, RuleEngine, peopleCapacity) {
        RuleEngine.execute(event, function(data){
                if(!data.result) {
                    if (data.cleanDisplays) {
                        this.cleanDisplaysOfEvent(event.displays);
                        this.setNewNextExecDate(event);
                    } else if(data.updateDisplays){
                        this.updateDisplayOfEvent(event.configData, event.displays, peopleCapacity)
                    }
                }
            }.bind(this));
    }
    updateDisplayOfEvent(config, display, peopleCapacity) {
        var Display = require('../models/display'),
            Image = require('../models/image');
        console.log("\nActualiza pantalla(s) de aforo a " + peopleCapacity);
        /*
        Display.findByIdAndUpdate(
            {_id: display._id},
            {activeImage: peopleCapacity},
            function(err, result) 
            {
                if (err) {
                console.log(err);
                } 
            }
        )*/
    }
    cleanDisplaysOfEvent (displays) {
        var Display = require('../models/display');
        console.log("Cleaning ActiveImages of displays: ");
        displays.forEach(display => {
            console.log("----> Id: ", display._id);
            Display.findByIdAndUpdate(
                {_id: display._id},
                {activeImage: null},
                function(err, result) 
                {
                    if (err) {
                    console.log(err);
                    } 
                }
            )
        });
    }
    
    setNewNextExecDate(event) {
        var Event = require('../models/event');
        var timeData = event.configData[0].timeData,
            newExecDate = new Date(timeData.nextExecDate),
            updatedConfigData = event.configData;
        console.log('Setting new exec date.');
        switch (timeData.periodicity) {

            case 'daily':
                newExecDate.setDate(newExecDate.getDate() + 1);
                break;

            case 'weekly':
                newExecDate.setDate(newExecDate.getDate() + 7);
                break;

            case 'monthly':
                newExecDate.setMonth(newExecDate.getMonth() + 1);
                break;
        }
        updatedConfigData[0].timeData.nextExecDate = newExecDate;
        Event.findByIdAndUpdate(
                {_id : event._id},
                {configData : updatedConfigData},
                function(err, result) 
                {
                    if (err) {
                    console.log(err);
                    } else {
                    console.log('Event next date to exec updated.\n id: ', result._id);
                    }
                }
            )
    }
}
module.exports  = nodeRuleProcessor;    