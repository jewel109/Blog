
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import axiosInstance from "@/lib/axios"
import axiosError from "@/lib/axiosError"
import { redirect, useRouter } from "next/navigation"
import AddPostHeader from "./postHeader"
import { useSelector } from "react-redux"
import { type RootState, useAppDispatch } from '@/lib/store/store'

import { addStory } from "../../../lib/features/storySlice"
import { Textarea } from "@/components/ui/textarea"
import { AxiosError } from "axios"

const formSchema = z.object({
  title: z.string().min(5, { message: "title must be 4 characters" }),
  content: z.string().min(20, { message: "content must 20 characters" })
})

let postData;
async function forCreatePost({ title, content }) {
  try {
    const token = localStorage.getItem("token") ?? null

    const headers = { "Authorization": `Bearer ${token}` }

    const { data } = await axiosInstance.post("/story/addStory", { title, content }, { headers: headers })

    console.log(data)
    postData = data.data.content ?? "no data"
  } catch (err) {
    const error = err as AxiosError
    console.log("forCreatePost " + error)
    axiosError(error)
  }
}

export default function ProfileForm() {
  const router = useRouter()
  const data = useSelector((state: RootState) => state.storyReducer)
  const dispatch = useAppDispatch()
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: ""
    },
  })


  // 2. Define a submit handler.
  function onSubmit({ title, content }: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(title, content)
    //forCreatePost(values)
    dispatch(addStory({ title, content }))
    // redirect('/home')
    // resetField("content")

    form.resetField("title")
    form.resetField("content")
    router.push("/")
  }

  return (<>
    <div className="bg-gray-100 min-h-screen">
      <AddPostHeader />
      <div className=" w-7/12 mx-auto  mt-6 rounded-xl">
        <Form {...form} >
          <div className="p-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>

                    <FormLabel>title</FormLabel>
                    <FormControl>
                      <Input  {...field}{...form.register} placeholder="your tittle will go here" className="min-h-12" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>

                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>

                    <FormLabel>content</FormLabel>
                    <FormControl >
                      <Textarea {...field} {...form.register} className="min-h-60" placeholder="your post content will go here" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>

                )}
              />
              <Button type="submit">Publish</Button>
            </form>
          </div>
        </Form>
      </div>
    </div>
    <div>
      {postData}
    </div>
  </>
  )
}
