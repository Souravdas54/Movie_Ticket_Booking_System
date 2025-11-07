import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

interface JwtPayload {
    userId?: string;
    email: string;
    // role: "user" | "admin";
    role: string;
}

declare module "express-serve-static-core" {
    interface Request {
        user?: JwtPayload;
    }
}

// export interface AuthRequest extends Request {
//   user?: JwtPayload;
// }

export const protect = (req: Request, res: Response, next: NextFunction) => {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer "))
        return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        // req.user = { id: decoded.id, email: decoded.email };

        const userId = decoded.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Invalid token: user ID missing"
            });
        }

        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};

export const authorizeRoles = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {

        if (!req.user) return res.status(401).json({ message: "Not authenticated" });

        if (allowedRoles.includes(req.user.role)) {
            console.log('✅ Access granted');
            return next();
        } else {
            console.log('❌ Access denied');
            return res.status(403).json({ message: "Forbidden: You don't have access" });
        }
        next();
    };
};