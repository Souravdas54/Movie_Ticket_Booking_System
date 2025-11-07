import { model, Schema } from 'mongoose';
import { userInertface } from "../interface/user.interface";
import Joi from 'joi'



//validation schema
export const signupSchemaValidation = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.number().required(),
  password: Joi.string().min(6).required(),
  profilePicture: Joi.string().optional(),
  role: Joi.string().required(),

})

export const LoginSchemaValidate = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const userSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone:{type:Number,required:true},
  password: { type: String, required: true },
  profilePicture: { type: String },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  role: { type: Schema.Types.ObjectId, ref: 'Role', required: true }
}, {
  timestamps: true
});

const userModel = model<userInertface>('User', userSchema);
export { userModel }