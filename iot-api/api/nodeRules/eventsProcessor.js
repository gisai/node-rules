const cron = require('node-cron');
const nodeRuleProcessor = require('./processor');
const Event = require ('../models/event.js');
const { SELECTION } = require('../controllers/static');

class EventsProcessor {
    constructor(){
        this.aforo = 0;
    }

    initEventTimeProcessor () {
            cron.schedule('*/5 * * * *',function(){ //Checkea eventos tipo Time cada 5 minutos.
              var   processorEventsTime = new nodeRuleProcessor("RuleTimeProcessor "+new Date().toLocaleString()),
                    allEvents = Event.find().select(SELECTION.events.short).exec();
              allEvents.then((data) => {
                if(data.length > 0) {
                    console.log("\n\nRunning nodeRule processor with name: \n" + processorEventsTime.name + "\n");
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

    initEventActionProcessor() {
        var object = this;
        function changeAforo(newValue, object) { //Simula un observer en cambio de aforo
            console.log('\nCambio de aforo ' + object.aforo + ' >>> ' + newValue);
            object.aforo = newValue;
            var processorEventsAction = new nodeRuleProcessor(("RuleActionProcessor "+new Date().toLocaleString())),
                allEvents = Event.find().select(SELECTION.events.short).exec();
            allEvents.then((data) => {
                if(data.length > 0) {
                    console.log("\n\nRunning nodeRule processor with name: \n" + processorEventsAction.name + "\n");
                    data.forEach(event => {
                        var RuleEngine = processorEventsAction.initRuleEngineEventAction();
                        processorEventsAction.processNodeRules(event, RuleEngine, object.aforo);
                    });
                }
            }).catch((err) => {
                    console.log(err);
                    next();
                })
        }
        cron.schedule('*/30 * * * * *',function(){
            changeAforo(Math.floor(Math.random() * 11 ) + 1, object); //Simula un cambio de aforo cada 30 segundos
        });
    }

    
}
module.exports  = EventsProcessor; 