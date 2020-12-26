const mongoose = require('mongoose');
const UserGroup = require('./userGroup.js');

const eventSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true},
    description: { type: String, default: 'Sin descripción' },
    type: {type: String, default:'time' , enum: ['time', 'action'] ,required : true},
    configData:{type: Array, required: true},
    enabled: { type: Boolean, default: false },
    displays: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Display' }],
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


module.exports = mongoose.model('Event', eventSchema);
