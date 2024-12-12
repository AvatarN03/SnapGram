import { z } from "zod";


export const SignupValidation = z.object({
    name: z.string().min(2, {message:"Too Short"}),
    username: z.string().min(2,{message:"username is too short"}),
    email: z.string().email(),
    password: z.string().min(8, {message:"Password is too short"}),
    
  })

export const SigninValidation = z.object({
    email: z.string().email(),
    password: z.string().min(8, {message:"Password is too short"}),
    
  })


export const PostValidation = z.object({
   caption:z.string().min(5).max(2200),
   file:z.custom<File[]>(),
   location: z.string().min(2).max(120),
   tags:z.string()
    
  })