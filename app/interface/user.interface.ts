import mongoose from "mongoose";

export interface userInertface {
  name: string;
  email: string;
  phone:number,
  password: string;
  profilePicture?: string;
  isVerified: boolean;
  verificationToken?: string;
  role: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}