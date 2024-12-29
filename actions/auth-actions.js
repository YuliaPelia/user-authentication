'use server'

import { hashUserPassword } from "@/lib/hash";
import { createUser } from "@/lib/user";
import { redirect } from "next/navigation";

export async function signup(prevState, formData) {
    const email = formData.get('email');
    const password = formData.get('password');

    const errors = {}

    if (!email.includes('@')) {
        errors.email = 'Please enter a valid email address';
    }

    if (password.trim().length < 8) {
        errors.password = 'Password must be at least 8 characters';
    }

    if (Object.keys(errors).length > 0) {
        return { errors };
    }

    const hashedPassword = hashUserPassword(password)
    try {
        console.log(hashedPassword);
        createUser(email, hashedPassword);
    } catch (error) {
        console.log(error);
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {

            return {
                errors: {
                    email: 'It seems an account with this email already exists'
                }
            }
        }
        throw error
    }

    redirect('/training')
}