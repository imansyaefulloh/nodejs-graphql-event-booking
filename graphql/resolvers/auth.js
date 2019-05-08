const bcrypt = require('bcryptjs');

const User = require('../../models/user');

module.exports = {
  users: async() => {
    return User
      .find({})
      .then(users => {
        console.log(users);
        return users.map(user => {
          return {
            ...user._doc,
            password: null
          };
        });
      })
      .catch(err => {
        console.log(err)
        throw err;
      });
  },
  createUser: async args => {
    try {
      const existingUser = await User.findOne({
        email: args.userInput.email
      });

      if (existingUser) {
        throw new Error('User already exists!');
      }

      const hashedPassword = await bcrypt.hash(args.userInput.password, 12)

      const user = new User({
        email: args.userInput.email,
        password: hashedPassword
      });

      const result = await user.save();

      return {
        ...result._doc,
        password: null
      };
    } catch (err) {
      throw err;
    }
  }
};