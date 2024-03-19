"use client";

import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import React from 'react'
import { useForm, SubmitHandler } from 'react-hook-form';
import { auth } from '../../../../firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Inputs = {
    email: string,
    password: string
}

const Login = () => {

    const router = useRouter();

    const { register, handleSubmit, watch, formState: { errors } } = useForm<Inputs>();
    const email = watch("email");
    const password = watch("password");

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        await signInWithEmailAndPassword(auth, data.email, data.password)
        .then((userCredential) => {
            router.push("/");
        }
        ).catch((error) => {

            if (error.code === 'auth/invalid-credential') {
            alert("User not found");
            } else {
                alert(error)
            }
        });
    };

    return (
        <div className='h-screen flex flex-col items-center justify-center'>
            <form onSubmit={handleSubmit(onSubmit)} className='bg-white p-8 rounded-lg shadow-md w-96'>
                <h1 className='text-2xl font-medium mb-4 text-gray-700'>Login</h1>
                <div className='mb-4'>
                    <label className='block text-sm font-medium text-gray-600'>Email</label>
                    <input {...register("email", {
                        required: "Email is required",
                        pattern: {
                            value: /\S+@\S+\.\S+/,
                            message: "Entered value does not match email format"
                        }
                    })} type="text" className='mt-1 border-2 rounded-md w-full p-2' />
                    {errors.email && <span className='text-red-600 text-sm'>{errors.email.message}</span>}
                </div>
                <div className='mb-4'>
                    <label className='block text-sm font-medium text-gray-600'>Password</label>
                    <input {...register("password", {
                        required: "Password is required",
                        minLength: {
                            value: 6,
                            message: "Password must have at least 6 characters"
                        }
                    })} type="password" className='mt-1 border-2 rounded-md w-full p-2' />
                    {errors.password && <span className='text-red-600 text-sm'>{errors.password.message}</span>}
                </div>

                <div className='flex justify-end'>
                    <button
                        type='submit'
                        className='bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700'>
                        Login
                    </button>
                </div>
                <div className='mt-4'>
                    <span className='text-gray-600 text-sm'>Don&apos;t have an account?</span>
                    <Link href={'/auth/register'}
                        className='text-blue-500 text-sm font-bold ml-2 hover:text-blue-700'>
                        SignUp
                    </Link>
                </div>
            </form>
        </div>
    )
}

export default Login