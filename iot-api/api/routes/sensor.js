const express = require('express');
const router = express.Router();
const EventsProcessor = require('../nodeRules/eventsProcessor'); 

/* CONTROLLER */
const checkAuth = require('../middleware/check-auth.js');

/* API GET */
router.post('/', checkAuth, (req, res) => {
    var eventsProcessor = new EventsProcessor();
    eventsProcessor.initEventActionProcessor(req.body.data);
    res.status(201).json({
        success: true,
        message: 'Success at updating peopleCapacity sensor to the server',
        notify: `Change on AFORO`,
    });
});


module.exports = router;