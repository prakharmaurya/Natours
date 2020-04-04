const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../modles/tourModel');
const Review = require('./../../modles/reviewModel');
const User = require('./../../modles/userModel');

dotenv.config({ path: './config.env' });

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    //console.log('Import data DB Connection is successful');
  });

//read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf8')
);
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf8'));

const importer = async () => {
  try {
    await Tour.create(tours);
    await Review.create(reviews);
    await User.create(users, { validateBeforeSave: false });
    //console.log('data successfully loaded');
  } catch (err) {
    //console.log(err);
  }
};

//delete data into DATABASE
const deleter = async () => {
  try {
    await Tour.deleteMany();
    await Review.deleteMany();
    await User.deleteMany();
    //console.log('data successfully deleted!');
  } catch (err) {
    //console.log(err);
  }
};

if (process.argv[2] == '--import') {
  importer();
} else if (process.argv[2] == '--delete') {
  deleter();
}

//console.log(process.argv);
