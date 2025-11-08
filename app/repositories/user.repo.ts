import { userModel } from "../models/user.Model";
import { userInertface } from '../interface/user.interface';
import { roleModel } from "../models/role.model";
import mongoose from "mongoose";
import fs from "fs";

class UserRepositories {
    //create a post
    async save(data: userInertface) {
        try {
            const roleDoc = await roleModel.findOne({ name: data.role });
            if (!roleDoc) throw new Error("Invalid role");

            data.role = roleDoc._id as mongoose.Types.ObjectId;

            const newDataCreate = await userModel.create(data)
            return newDataCreate;

        } catch (error) {
            console.log(error)
        }
    }

    async findByEmail(email: string) {
        try {
            const findEmailId = await userModel.findOne({ email });
            return findEmailId;

        } catch (error) {
            console.log(error)
        }
    }
    //all data
    async find() {
        try {
            const getAllUsers = await userModel.find()
            return getAllUsers
        } catch (error) {
            console.log(error)
        }
    }
    //single data get
    async getUserById(id: string) {
        try {
            const getuser = await userModel.findById({ _id: id })
            if (!getuser) {
                return 'user not available'
            }
            return getuser
        } catch (error) {
            console.log(error);
        }
    }

    //update a profile
    async update_user(id: string, data: Partial<userInertface>, newProfilePicture?: string) {
        try {
            const user = await userModel.findById(id);
            if (!user) return null;

            if (data.name) user.name = data.name;
            if (data.phone) user.phone = data.phone;

            // Update profile picture
            if (newProfilePicture) {
                const oldPic = user.profilePicture;
                // Delete old image 
                if (oldPic && fs.existsSync(oldPic)) {
                    fs.unlinkSync(oldPic);
                }
                user.profilePicture = newProfilePicture;
            }

            const updatedUser = await user.save();
            return updatedUser;

        } catch (error) {
            console.log(error);
            throw error;
        }
    }

}

const userRepositories = new UserRepositories()

export { userRepositories }

