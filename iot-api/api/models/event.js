const mongoose = require('mongoose');
const UserGroup = require('./userGroup.js');
const nodeRuleProcessor = require('../nodeRules/processor');
const cron = require('node-cron');

const eventSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true},
    description: { type: String, default: 'Sin descripción' },
    type: {type: String, default:'time' , enum: ['time', 'action'] ,required : true},
    configData:{type: Array, required: true},
    enabled: { type: Boolean },
    displays: { type: Array},//[{ type: mongoose.Schema.Types.ObjectId, ref: 'Display' }],
    userGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'UserGroup', required: true},
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

// Before creating a new image an _id must be set in order to configure the url properly
eventSchema.pre('save', function (next) {
  const id = new mongoose.Types.ObjectId();
  this._id = id;
  this.url = `${process.env.API_URL}images/${id}`;
  UserGroup.update({ _id: this.userGroup }, { $addToSet: { images: id } });
  next();
});

// After removing an image, it must be removed from any resource that may reference him
eventSchema.post('remove', { query: true, document: false }, function () {
  const Display = require('./display.js');
  const { _id } = this.getQuery();
  Promise.all([
    UserGroup.findOneAndUpdate({ images: _id }, { $pull: { images: _id } }),
    Display.updateMany({ images: _id }, { $pull: { images: _id } })
  ]);
});

eventSchema.pre('remove', { query: true, document: false }, function(){
  var idEvent = this._conditions._id;
      query = this.where({_id : idEvent});
  query.findOne(function(error, event) {
      if (error) return handleError(err);
      if (event) {
        var processor = new nodeRuleProcessor("\nProcesing event saved with id " + idEvent);
            processor.cleanNodeRules(event.task);
      }
  })
});

eventSchema.post('findOneAndUpdate', function(){
  var eventUpdated = this._update.$set,
      processor = new nodeRuleProcessor("\nProcesing event updated with id  " + this._conditions._id);
      eventUpdated._id = this._conditions._id;
      console.log(processor.name)
      processor.processNodeRules(eventUpdated);
});

eventSchema.post('save', function(){
  var eventSaved = this,
      processor = new nodeRuleProcessor("\nProcesing event saved with id " + eventSaved._id);
      console.log(processor.name)
      processor.processNodeRules(eventSaved);
});


module.exports = mongoose.model('Event', eventSchema);
