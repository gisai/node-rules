var RulesEngineInitializer = require('./rulesGenerator');
var RuleEngine = require('node-rules');
var BmpGenerator = require('./bmpGenerator');

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
                        this.updateDisplaysOfEvent(event.displays, peopleCapacity);
                    }
                }
            }.bind(this));
    }

    cleanDisplaysOfEvent (displays) {
        var Display = require('../models/display');
        console.log("Cleaning ActiveImages of displays: ");
        displays.forEach(display => {
            console.log("----> Id: ", display._id);
            Display.findByIdAndUpdate(
                {_id: display._id},
                {activeImage: null},
                function(err) 
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

    updateDisplaysOfEvent (displays, peopleCapacity) {
        var Display = require('../models/display'),
            Image = require('../models/image'),
            Device = require('../models/device'),
            User = require('../models/user'),
            Screen = require('../models/screen');
        displays.forEach(display => {
            Display.findOne({_id: display}).exec()
                .then(function  (displayFinded) {
                    var newActiveImage = displayFinded.activeImage,
                        newImages = displayFinded.images;
                    Device.findOne({_id: displayFinded.device}).exec()
                        .then(function (deviceFinded) {
                            Screen.findOne({screenCode: deviceFinded.screen}).exec()
                                .then(function (screenDevice) {
                                    Image.findOne({name:'peopleCapacityImage'}).exec()
                                    .then(function (imageFinded) {
                                        var bmpGenerator = new BmpGenerator();
                                        bmpGenerator.imageGenerator(peopleCapacity, screenDevice);
                                        if (imageFinded != null) {
                                            if (newImages.indexOf(imageFinded._id) < 0) {
                                                newImages.push(imageFinded._id);
                                            }
                                            newActiveImage = imageFinded._id;
                                            Image.findByIdAndUpdate(imageFinded._id,{
                                                src:`${process.env.API_URL}`+'img/'+ screenDevice._id +'_peopleCapacity.bmp',
                                                path:`${process.env.API_URL}`+'img/'+ screenDevice._id +'_peopleCapacity.bmp',
                                            }).exec().then(console.log("updated src and path of image with id " + imageFinded._id));
                                            Display.findByIdAndUpdate(displayFinded.id, {
                                                images : newImages,
                                                activeImage : newActiveImage
                                            }).exec().then(console.log("Updated display with existing Image"));
                                        } else {
                                            var newImage = new Image();
                                            newImage.name ='peopleCapacityImage';
                                            newImage.description ='Image for People Capacity';
                                            newImage.src = `${process.env.API_URL}`+'img/'+ screenDevice._id +'_peopleCapacity.bmp';
                                            newImage.path = `${process.env.API_URL}`+'img/'+ screenDevice._id +'_peopleCapacity.bmp';
                                            newImage.extension = 'bmp';
                                            newImage.category = 'screen/peopleCapacity';
                                            newImage.displays = [displayFinded._id];
                                            newImage.color = 'Escala de grises';
                                            User.findOne({name:'admin'}).exec()
                                                .then(function(admin){
                                                    newImage.createdBy = admin._id;
                                                    newImage.save().then((image) => {
                                                        console.log("New Image saved");
                                                        newImages.push(image._id);
                                                        newActiveImage = image._id;
                                                        Display.findByIdAndUpdate(displayFinded._id, {
                                                            images : newImages,
                                                            activeImage : newActiveImage
                                                        }).exec().then(console.log("Updated display with new Image"));
                                                    });
                                            })
                                        }
                                    })
                                });
                            });
                });
        });
    }
}
module.exports  = nodeRuleProcessor;    