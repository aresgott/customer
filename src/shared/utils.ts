import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};

export const generateAccessToken = (customerId: string, role: string): string => {
    const payload = { customerId, role };
    return jwt.sign(payload, accessTokenSecret, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_TIME });
};

export const generateRefreshToken = (customerId: string, role: string): string => {
    const payload = { customerId, role };
    return jwt.sign(payload, refreshTokenSecret, { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_TIME });
};