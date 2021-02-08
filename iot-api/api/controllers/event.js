const fs = require('fs');

/* DATA MODELS */
const Event = require('../models/event');
const { SELECTION, MESSAGE } = require('./static');

/* GET ALL */
exports.eventGetAll = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json(MESSAGE[401]);
    } else {
      const event = await Event.find()
        .select(SELECTION.events.short)
        .exec();
      if (event) {
        res.status(200).json(event);
      } else {
        res.status(404).json(MESSAGE[404]);
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(MESSAGE[500](error));
  }
};

/* GET ONE */
exports.eventGetOne = async (req, res) => {
  try {
    const { id } = req.params;
    const query = req.AuthData.admin ? { _id: id } : { _id: id, userGroup: req.AuthData.userGroup };
    const event = await Image.findById(query)
      .select(SELECTION.events.long)
      .populate('displays', SELECTION.displays.populate)
      .populate('createdBy', SELECTION.screens.populate)
      .populate('updatedBy', SELECTION.users.populate)
      .populate('userGroup', SELECTION.userGroups.populate)
      .exec();
    if (event) {
      res.status(200).json(event);
    } else {
      res.status(404).json(MESSAGE[404]);
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(MESSAGE[500](error));
  }
};

/* POST */
exports.eventCreate = async (req, res) => {
  try {
    const { body } = req;
    body.size = 0;
    const event = new Event(body);
    const { _id } = await event.save();
    const newEvent = await Event.findById(_id).select(SELECTION.events.short);
    res.status(201).json({
      success: true,
      message: 'Success at uploading an event to the server',
      notify: `Evento '${newEvent.name}' creada`,
      resourceId: newEvent._id,
      resource: newEvent,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* PUT */
exports.eventUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req;
    const event = await Event.findOneAndUpdate({ _id: id}, { $set: body }, { new: true }).select(SELECTION.events.short);
    if(event) {
      res.status(201).json({
        message: 'Succes at updating an event from the collection',
        notify: `${event.name} actualizada`,
        success: true,
        resourceId: id,
        resource: event,
      });
    } else {
      res.status(404).json(MESSAGE[404]);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(MESSAGE[500](error));
  }
};

/* DELETE */
exports.eventDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const query = req.AuthData.admin ? { _id: id } : { _id: id, userGroup: req.AuthData.userGroup };
    const event = await Event.findOne(query).remove();
    if (event) {
      res.status(200).json({
        message: 'Success at removing an event from the collection',
        success: true,
        resourceId: id,
      });
    } else {
      res.status(404).json(MESSAGE[404]);
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(MESSAGE[500](error));
  }
};