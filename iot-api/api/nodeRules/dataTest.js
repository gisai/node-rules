const Display = require('../models/display.js');
const Image = require('../models/image.js');
const Screen = require('../models/screen.js');
const Device = require('../models/device.js');
const UserGroup = require('../models/userGroup');

class testData {
    constructor(){
        let display1 = new Display(),
            display2 = new Display(),
            device = new Device(),
            image1 = new Image(),
            image2 = new Image(),
            screen = new Screen(),
            device1 = new Device(),
            groupTest = new UserGroup();

        display1.name = "TEsting";
        display1.description = "data for testing";
        display1.save();
        console.log('\n\n')

        device1.mac = '127.0.0.1';
        device1.batt = '22';
        device1.rssi = '34';
        device1.save();

    }
}

module.exports  = testData; 