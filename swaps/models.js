'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const swapSchema = mongoose.Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  start_coord: {
    type: [Number],   
    index: '2d'
  },
  submitDate: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    required: true
  },
  tags: [{
    type: Schema.Types.Mixed,
    required: true
  }],
  interestedUsers: [{
    type: Schema.ObjectId
  }],
  available: {
    type: Boolean,
    required: true
  }
});

swapSchema.methods.serialize = function() {
	return this;
}

const swapEntry = mongoose.model('swapEntry', swapSchema);

module.exports = {swapEntry};