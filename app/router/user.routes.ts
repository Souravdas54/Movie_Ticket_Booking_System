import express from 'express';
import { userController } from '../controllers/user.controller';
import { protect, authorizeRoles } from '../middleware/auth.middleaware';
import upload from '../middleware/upload.middleware';

const router = express.Router()


router.post('/register', upload.single('profilePicture'), userController.register)
router.get('/verify-email/:token', userController.verifyEmail);
router.post('/login', userController.login)

router.get('/profile', protect, authorizeRoles('admin','user'), userController.getUserprofile)
router.get('/profile/:id', protect, authorizeRoles('admin','user'), userController.getUserById)

router.put('/profile/:id', protect, authorizeRoles('admin','user'), upload.single('profilePicture'), userController.updateProfile);



export { router }