import { Request, Response } from 'express';
import { signupSchemaValidation } from '../models/user.Model';
import { userRepositories } from '../repositories/user.repo';
import { LoginSchemaValidate } from '../models/user.Model';
import _ from 'lodash'
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import emailService from '../utils/emailSender'
import { roleModel } from '../models/role.model';

class UserController {

  async register(req: Request, res: Response): Promise<any> {
    try {

      const { error, value } = signupSchemaValidation.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.message });
      }

      const existingUser = await userRepositories.findByEmail(value.email);
      if (existingUser)
        return res.status(400).json({ message: "Email already registered" });

      let profilePictureUrl = "";
      if (req.file && (req.file as any).path) {
        profilePictureUrl = (req.file as any).path;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(value.password, salt);

      const verificationToken = jwt.sign({
        userId: value.id,
        email: value.email,
        role: value.role
      },
        process.env.JWT_SECRET as string,
        { expiresIn: '1d' });

      const userData = {
        ...value,
        password: hashedPassword,
        profilePicture: profilePictureUrl,
        verificationToken,
        isVerified: false
      };

      const newUserdata = await userRepositories.save(userData);

      const emailResult = await emailService.sendVerificationEmail(
        value.email,
        verificationToken,
        value.name
      );

      if (!emailResult.success) {
        console.log('Failed to send verification email:', emailResult.error);
        console.log('⚠️ Account created but email sending failed');
      } else {
        console.log('✅ Verification email sent successfully');
      }

      if (_.isObject(newUserdata) && newUserdata._id) {
        return res.status(200).send({
          message: "Registration successful. Please verify your email.",
          data: newUserdata,
        });
      } else {
        return res.status(400).send({
          message: "Failed to register new user",
        });
      }

    } catch (error) {
      console.log(error);
      return res.status(500).send({
        message: "Internal Server Error",
      });
    }
  }

  async verifyEmail(req: Request, res: Response): Promise<any> {
    try {
      const { token } = req.params;
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
      const user = await userRepositories.findByEmail(decoded.email);

      if (!user) return res.status(404).send({ message: "User not found" });

      user.isVerified = true;
      user.verificationToken = "";
      await user.save();

      return res.status(200).send({ message: "Email verified successfully!" });

    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: "Invalid or expired token" });
    }
  }

  async login(req: Request, res: Response): Promise<any> {
    try {
      const data = {
        email: req.body.email,
        password: req.body.password,
      };

      const { error, value } = LoginSchemaValidate.validate(data);
      if (error) {
        return res.status(400).send(error.message);
      }

      const userData = await userRepositories.findByEmail(value.email);
      if (!userData) {
        return res.status(404).send({
          message: "User not found",
        });
      }

      const isPasswordMatch = await bcrypt.compare(value.password, userData.password);
      if (!isPasswordMatch) {
        return res.status(401).send({
          message: "Invalid password",
        });
      }

      // role name from role collection

      let roleName: string;

      if (typeof userData.role === 'string') {
        // If role is already stored as string (role name)
        roleName = userData.role;
      } else {
        // If role is stored as ObjectId, fetch the role name
        const roleDoc = await roleModel.findById(userData.role);
        if (!roleDoc) {
          return res.status(500).json({
            success: false,
            message: "Role not found"
          });
        }
        roleName = roleDoc.name;
      }

      const payload = {
        name: userData.name,
        userId: userData._id.toString(),
        email: userData.email,
        phone: userData.phone,
        // role: userData.role,
        role: roleName,
      };
      console.log('🔐 Login payload:', payload);


      const secretKey = process.env.JWT_SECRET as string;
      const token = jwt.sign(payload, secretKey, { expiresIn: "1d" });

       const emailResult = await emailService.sendWelcomeEmail(
        userData.email,
        userData.name
      );

      if (!emailResult.success) {
        console.log('Failed to send welcome email:', emailResult.error);
        console.log('⚠️ Account login but email sending failed');
      } else {
        console.log('✅ Welcome email sent successfully');
      }

      return res.status(200).send({
        message: "Login successful",
        data: _.omit(userData.toObject(), ["password"]),
        role: roleName,
        token,
        // role: userData.role,
      });

    } catch (error) {
      console.log(error);
      return res.status(500).send({
        message: "Internal Server Error",
      });
    }
  }


  async getUserprofile(req: Request, res: Response): Promise<any> {
    try {
      const userData = await userRepositories.find()

      // const userDataget = _.sortBy(userData, ['name'])
      if (_.isObject(userData)) {
        return res.status(200).send({
          message: "data get successfully",
          data: userData,
        });
      } else {
        return res.status(400).send({
          message: "Failed to registration new user",
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getUserById(req: any, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const user = await userRepositories.getUserById(id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({
        message: "User fetched successfully",
        data: user,
        // data: _.omit(user.toObject(), ["password"]),
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async updateProfile(req: any, res: Response): Promise<any> {
    try {
      console.log('🔄 Update profile request received');
      console.log('Full req.user:', req.user);

      const userId = req.user?.userId;
      if (!userId) {
        console.log('User not authenticated or userID missing');
        return res.status(401).json({
          success: false,
          message: "User not authenticated"
        });
      }

      console.log('Request body:', req.body);
      console.log('File:', req.file);

      const updateData: any = {};

      if (req.body.name) updateData.name = req.body.name;
      if (req.body.phone) updateData.phone = req.body.phone;

      let newProfilePicture: string | undefined;
      if (req.file) {
        console.log("Uploaded File Info:", req.file);

        newProfilePicture = req.file.path
      }

      const updatedUser = await userRepositories.update_user(
        req.user.userId,
        updateData,
        newProfilePicture
      );

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      const userResponse = {
        _id: updatedUser._id,
        name: updatedUser.name,
        phone: updatedUser.phone,
        email: updatedUser.email,
        role: updatedUser.role,
        profilePicture: updatedUser.profilePicture,
        isVerified: updatedUser.isVerified,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      };

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: userResponse
      });

    } catch (error: any) {
      console.error('Update profile error:', error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error"
      });
    }
  }

}

export const userController = new UserController();