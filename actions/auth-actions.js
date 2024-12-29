'use server'

import { createAuthSession, destroyAuthSession } from "@/lib/auth";
import { hashUserPassword, verifyPassword } from "@/lib/hash";
import { createUser, getUserByEmail } from "@/lib/user";
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
        // console.log(hashedPassword);
        const userId = createUser(email, hashedPassword);
        await createAuthSession(userId)
        redirect('/training')

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



}

export async function login(prevState, formData) {
    const email = formData.get('email');
    const password = formData.get('password');

    const exitingUser = getUserByEmail(email);

    if (!exitingUser) {
        return {
            errors: {
                email: 'It seems an account with this email does not exist'
            }
        }
    }

    const isValidPassword = verifyPassword(exitingUser.password, password)

    if (!isValidPassword) {
        return {
            errors: {
                password: 'Invalid password'
            }
        }
    }

    await createAuthSession(exitingUser.id)
    redirect('/training')


}
export async function auth(mode, prevState, formData) {
    if (mode === 'login') {
        return login(prevState, formData)
    } else if (mode === 'signup') {
        return signup(prevState, formData)
    }
}


export async function logout() {
    await destroyAuthSession()

    redirect('/')
}