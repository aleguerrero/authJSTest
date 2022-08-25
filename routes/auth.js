const router = require("express").Router();
const User = require("../model/User");
const bcrypt = require('bcryptjs');
const { registerValidation, loginValidation } = require("../validation");

router.post("/register", async (req, res) => {

  // Validates data
  const { error } = registerValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  // checks if the user is already in the database
  const emailExist = await User.findOne({ email: req.body.email })
  if (emailExist) return res.status(400).send('Email already exists');

  // Hash passwords
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword
  });

  try {
    const savedUser = await user.save();
    res.send({
      user: user._id
    });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post('/login', async (req, res) => {
  // Validates data
  const { error } = loginValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  // checks if the user exists in the database
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send('Email does not exist');

  // check if password is correct
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send('Invalid password')

  res.send('Logged in!');
})

module.exports = router;
