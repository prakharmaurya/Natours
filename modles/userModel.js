const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'please tell us your name'],
      trim: true,
      maxlength: [40, 'name must not exceed 40 character'],
      minlength: [5, 'name must not less than 4 character'],
      //validate: validator.isAlpha
      //validate: [validator.isAlpha, 'please provide a valid name'],
    },
    email: {
      type: String,
      required: [true, 'A User must have a email'],
      trim: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'please provide an email'],
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'password must be greater than 8 character'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      minlength: [8, 'password must be greater than 8 character'],
      validate: {
        //only works for create and save!!!
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords are not the same!',
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  }
  //{ toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// tourSchema.virtual('durationWeeks').get(function () {
//   return this.duration / 7;
// });

//Document middleware(hook for save) run before .save() & .create()
userSchema.pre('save', async function (next) {
  //this fn runs only if password is modified
  if (!this.isModified('password')) return next();

  //Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  //Delete the password confirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// // tourSchema.pre('save', function (next) {
// //   console.log('doc saved');
// //   next();
// // });

// // tourSchema.post('save', function (doc, next) {
// //   console.log(doc);
// //   next();
// // });

// //this is query middleware
// tourSchema.pre(/^find/, function (next) {
//   // tourSchema.pre('find', function (next) {
//   this.find({ secretTour: { $ne: true } });
//   this.start = Date.now();
//   next();
// });

// tourSchema.post(/^find/, function (doc, next) {
//   console.log(`Query took ${Date.now() - this.start} miliseconds!!`);
//   //console.log(doc);
//   next();
// });

// //aggregation middleware
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({
//     $match: { secretTour: { $ne: true } },
//   });
//   console.log(this);
//   next();
// });

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(JWTTimeStamp, changedTimeStamp);
    return JWTTimeStamp < changedTimeStamp;
  }

  //false means not changes
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
