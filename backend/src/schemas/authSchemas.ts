import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(2).max(100),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format').optional(),
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['FARMER', 'OFFICER', 'GOVERNMENT', 'ANALYST', 'ADMIN']).default('FARMER'),
  preferredLanguage: z.enum(['hi', 'en']).default('hi'),
  assignedLocationId: z.string().uuid().optional(),
}).refine((data) => data.phoneNumber || data.email, {
  message: 'Either phoneNumber or email must be provided',
  path: ['email'],
});

export const loginSchema = z.object({
  phoneNumber: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(1, 'Password is required').optional(),
  otp: z.string().optional(),
}).refine((data) => data.phoneNumber || data.email, {
  message: 'Must provide either phoneNumber or email to authenticate',
  path: ['email'],
});
