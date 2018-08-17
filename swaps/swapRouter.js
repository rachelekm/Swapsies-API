'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const jsonParser = bodyParser.json();
const path = require("path");
const passport = require('passport');

const { router: authRouter, localStrategy, jwtStrategy } = require('../auth');
passport.use(jwtStrategy);
const jwtAuth = passport.authenticate('jwt', { session: false });

const {swapEntry} = require('./models');

router.post('/', jsonParser, jwtAuth, (req, res)=>{
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 1);
  let user = req.body;
  console.log(user);

  let coords = [];
  coords[0] = user.latLong.lng;
  coords[1] = user.latLong.lat;

  return swapEntry.find({ start_coord: { $geoWithin: { $center: [ coords, 0.05 ] } } }).then(swaps => {
    console.log(swaps);
      return res.status(200).json(swaps.map(entry=>entry.serialize()));
    })
    .catch(err => {
      console.log(err);
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal server error'});
    });
});
/*
router.get('/userSwaps', jwtAuth, (req, res)=>{
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - 1);
  let user = req.user.id;
  return dreamEntry.find({$and: [{user: user}, {submitDate: {"$gte": new Date(cutoffDate), "$lt": new Date()}}]}).populate('user').then(dreams => {
      return res.status(200).json(dreams.map(entry=>entry.serialize()));
    })
    .catch(err => {
      console.log(err);
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal server error'});
    });
});

*/ 
router.get('/', jsonParser, jwtAuth, (req, res)=>{
  return swapEntry.find()
  .then((swap) => {
    return res.status(200).json(swap.map(entry=>entry.serialize()));
  })
  .catch(err => {
    console.log(err);
        res.status(500).json({ message: 'Internal server error' });
  });
});


router.post('/add', jsonParser, jwtAuth, (req, res) => {
  let newSwap = req.body;
  let newUser;
	const requiredFields = ['submitDate', 'description', 'tags', 'interestedUsers', 'available'];
  const missingField = requiredFields.find(field => !(field in newSwap));
  if (missingField) {
    	return res.status(422).json({
      	code: 422,
      	reason: 'ValidationError',
      	message: 'Missing field',
      	location: missingField
    	});
  }
  newUser = req.user.id;
  return swapEntry.find({$and: [{submitDate: newSwap.submitDate}, {user: newUser}]})
  .count()
  .then(count => {
    /*if (count > 0) {
      return Promise.reject({
        code: 422,
        reason: 'ValidationError',
        message: 'A swap entry has already been submitted today'        
      });
    }*/
    return swapEntry.create({

    user: newUser,
    restaurantTitle: newUser.affiliationName,
    start_coord: [req.user.latLong.lng, req.user.latLong.lat],
    submitDate: newSwap.submitDate,
    description: newSwap.description,
    tags: newSwap.tags,
    interestedUsers: newSwap.interestedUsers,
    available: newSwap.available

    });
  })
    .then(swap => {
      return res.status(201).json(swap.serialize());
    })
    .catch((err) => {
      console.log(err);
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: `Internal server error, ${err}`});
    });
});

router.put('/:id', jsonParser, jwtAuth, (req, res) => {
  const requiredFields = ['submitDate', 'description', 'tags', 'interestedUsers', 'available'];
  const newObject= {};
  requiredFields.forEach(field => {
    if(field in req.body){
      newObject[field] = req.body[field];
    }
  });
  console.log(req.body);
  if(req.body._id !== req.params.id){
        const message = `Request path id (${req.params.id}) and request body id (${req.body._id}) must match`;
        console.error(message);
        return res.status(400).send(message);
  }
  swapEntry.findByIdAndUpdate(req.params.id,
    {$set: newObject})
  .then(function(entry){
    res.status(204).end()})
  .catch(err => {
    console.log(err);
    res.status(500).json({message: `Internal server error, ${err}`})
  });
});

router.delete('/:id', jsonParser, jwtAuth, (req, res) => {
  swapEntry.findByIdAndRemove(req.params.id)
  .then(dream => {
  console.log(`Deleted dream entry ID: ${req.params.id}`);
  res.status(204).end();
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({message: 'Internal server error'})
  });
});
/*

router.post('/dream-log', jsonParser, jwtAuth, (req, res) => {
  let query = req.body.search.toString();
  const user = req.user.id;
  if(query.indexOf(',') != -1){
        query = query.split(', ');
  }
  if(typeof query == 'string'){

  return dreamEntry.find({$and: [{user: user}, {$or: [ { 'mood' : { $regex: query, $options: 'i' }}, { 'keywords' : { $regex: query, $options: 'i' }}, { 'content' : { $regex: query, $options: 'i' }}, { 'lifeEvents' : { $regex: query, $options: 'i' }}]}]}).then(function(entries){
    return res.status(200).json({query: query, entries: entries});
  })
  .catch(err => {
    console.log(err);
    if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
    return res.status(500).json({ message: 'Internal server error' });
    });
  }

  if(typeof query === 'object'){
    let regex = [];
    for (let i = 0; i < query.length; i++) {
    regex[i] = new RegExp(query[i]);
    }
    return dreamEntry.find({$and: [{user: user}, {$or: [ { 'mood' : { $in: regex }}, { 'keywords' : { $in: regex }}, { 'content' : { $in: regex }}, { 'lifeEvents' : { $in: regex }}]}]}).then(function(entries){
      return res.status(200).json({query: query, entries: entries});
    })
    .catch(err => {
      console.log(err);
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      return res.status(500).json({ message: 'Internal server error' });
    });
  }
});*/

module.exports = {router};
