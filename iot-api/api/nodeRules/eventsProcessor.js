const cron = require('node-cron');
const nodeRuleProcessor = require('./processor');
const Event = require ('../models/event.js');
const { SELECTION } = require('../controllers/static');

class EventsProcessor {
    constructor(){
        this.aforo = 0;
    }

    initEventTimeProcessor () {
            cron.schedule('*/1 * * * *',function(){ //Checkea eventos tipo Time cada 5 minutos.
                var   processorEventsTime = new nodeRuleProcessor("RuleTimeProcessor "+new Date().toLocaleString()),
                        allEvents = Event.find().select(SELECTION.events.short).exec();
                console.log('------------------------ Time checker ------------------------');
                allEvents.then((data) => {
                    if(data.length > 0) {
                        console.log("\nRunning nodeRule processor with name: \n" + processorEventsTime.name + "\n");
                        data.forEach(event => {
                            var RuleEngine = processorEventsTime.initRuleEngineEventTime();
                            processorEventsTime.processNodeRules(event, RuleEngine);
                        });
                    }
            }).catch((err) => {
                    console.log(err);
                    next();
                })
            });
 
    }

    initEventActionProcessor(PeopleCapacityValue) {
            console.log("------------------------ PeopleCapacity sensor changue ------------------------");
            console.log("Aforo change to --> "+PeopleCapacityValue);
            var processorEventsAction = new nodeRuleProcessor(("RuleActionProcessor "+new Date().toLocaleString())),
                allEvents = Event.find().select(SELECTION.events.short).exec();
            allEvents.then((data) => {
                if(data.length > 0) {
                    console.log("\nRunning nodeRule processor with name: \n" + processorEventsAction.name + "\n");
                    data.forEach(event => {
                        var RuleEngine = processorEventsAction.initRuleEngineEventAction();
                        processorEventsAction.processNodeRules(event, RuleEngine, PeopleCapacityValue);
                    });
                }
            }).catch((err) => {
                    console.log(err);
                    next();
                })
        }
    }

module.exports  = EventsProcessor; 