import { Request, Response, NextFunction } from 'express';
import { roleModel } from '../models/role.model';

export const createDefaultRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const existingRoles = await roleModel.find();
        if (existingRoles.length === 0) {
            const defaultRoles = [
                {
                    name: 'admin',
                    permissions: [
                        'manage_users',
                        'manage_movies',
                        'manage_theaters',
                        'view_reports',
                        'assign_movies'
                    ]
                },
                {
                    name: 'user',
                    permissions: [
                        'view_profile',
                        'edit_profile',
                        'book_tickets',
                        'cancel_booking',
                        'view_booking_history'
                    ]
                },
            ]

            await roleModel.insertMany(defaultRoles);
            console.log("✅ Default roles created successfully");
        }
        next();
    } catch (error) {
        console.error(error);
        next(error);
    }
};


