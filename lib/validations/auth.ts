import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type SignInRequest = z.infer<typeof signInSchema>;
export type SignUpRequest = z.infer<typeof signUpSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;
