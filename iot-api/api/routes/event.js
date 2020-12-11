const express = require('express');

const router = express.Router();

/* CONTROLLER */
const eventController = require('../controllers/event.js');
const checkAuth = require('../middleware/check-auth.js');

/* API GET */
router.get('/', checkAuth, eventController.eventGetAll);
router.get('/:id', checkAuth, eventController.eventGetOne);

/* API PUT */
router.put('/:id', checkAuth, eventController.eventUpdate);

/* API DELETE */
router.delete('/:id', checkAuth, eventController.eventDelete);

module.exports = router;
