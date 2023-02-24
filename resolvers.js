import { quotes, users } from "./fakedb.js";
import { randomBytes } from "crypto";
import mongoose from "mongoose";
const User = mongoose.model("User");
const Quote = mongoose.model("Quote");
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config.js";

const resolvers = {
  Query: {
    users: async () => await User.find({}),
    user: async (_, { _id }) => await User.findOne({_id}),
    quotes: async () =>{
     const result =  await Quote.find({}).populate("by", "_id firstName")
    return result
    },
    iquotes: async (_, { by }) => await Quote.find({by}),
  },
  User: {
     quotes:async (user) => await Quote.find({ by: user._id}),
  },
  Mutation: {
    signupUser: async (_, { userNew }) => {
      const user = await User.findOne({ email: userNew.email });
      if (user) throw new Error("User already exist with that email");
      const hashPassword = await bcrypt.hash(userNew.password, 10);
      const newUser = new User({ ...userNew, password: hashPassword });
      return await newUser.save();
    },
    signinUser: async (_, { userSignin }) => {
      const user = await User.findOne({ email: userSignin.email });
      if (!user) throw new Error("User doesnt exist with this email");
      const doMatch = await bcrypt.compare(userSignin.password, user.password);
      if (!doMatch) throw new Error("Email or password is invalid");
      const token = jwt.sign({ userId: user._id }, JWT_SECRET);
      return { token };
    },
    createQuote: async (_, { name }, { userId }) => {
      //TODO
      if (!userId) throw new Error("You must be logged In");
      const newQuote = new Quote({
        name,
        by: userId,
      });

      await newQuote.save();
      return "Quote saved successfully";
    },
  },
};

export default resolvers;
