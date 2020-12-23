const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: [{ type: String, default: '' }],
    description: [{ type: String, default: '' }],
    enabled: [{ type: Boolean, default: true }],
    displays: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Display' }],
    userGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'UserGroup' },
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
  const Group = require('./group.js');
  const { _id } = this.getQuery();
  Promise.all([
    UserGroup.findOneAndUpdate({ images: _id }, { $pull: { images: _id } }),
    Display.updateMany({ images: _id }, { $pull: { images: _id } }),
    Group.updateMany({ images: _id }, { $pull: { images: _id } }),
  ]);
});


module.exports = mongoose.model('Event', eventSchema);
