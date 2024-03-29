import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
import { useSelector } from "react-redux";
import { useAppDispatch, type RootState } from "@/app/store/store";
import { addComment, getAllCommentOfaStory } from "@/app/features/commentSlice";
import { useEffect, useState } from "react";
import { LogOut, MessageSquare, ThumbsUp } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { ToastAction } from "@radix-ui/react-toast";
import { useRouter } from "next/navigation";
import axiosError from "@/lib/axiosError";
import axiosInstance from "@/lib/axios";

export default function CommentInPost() {
  const commentData = useSelector((state: RootState) => state.commentReducer)
  const storyData = useSelector((state: RootState) => state.storyReducer)

  const [submit, setSubmit] = useState(false)
  console.log(commentData)
  const dispatch = useAppDispatch()
  const refetchComments = () => {
    setSubmit(!submit)
  }

  useEffect(() => {
    dispatch(getAllCommentOfaStory({ slug: storyData.slug }))
    console.log("i am called")
    console.log(storyData)
  }, [submit])


  return (
    <>

      <div id="comment-box" className="px-4 bg-white ">
        <div>
          <Card className="border-none">
            <CardHeader>
              <CardTitle>Comments</CardTitle>
            </CardHeader>
          </Card>
        </div>
        <div>
          <Card className="border-none">
            <div className="grid grid-flow-col gap-2 p-4">
              <div className="col-span-1">user</div>
              <div className="col-span-11 grid">
                <div className="">
                  <CommentForm refetchComments={refetchComments} />
                </div>
              </div>
            </div>
          </Card>
        </div>
        <div>
          {
            commentData.commentList ? commentData.commentList.map((comment) => (


              <Comment key={comment._id} id={comment._id} username={comment.author} time={comment.date} content={comment.content} />
            )) : (<div className="bg-red-700">no comment</div>)



          }

        </div>

      </div>
    </>)
}

const Comment = ({ username, time, content, id }) => {
  const userData = useSelector((state: RootState) => state.userReducer)
  const router = useRouter()
  const commentLikeHandler = async () => {
    try {
      if (!userData.username) {
        toast({
          description: "You are not logged in ",
          action: <ToastAction altText="Log in" onClick={() => {
            router.push("/profile/login")
          }}>Log in</ToastAction>
        })
      }
      console.log(id)
      const data = await axiosInstance.post(`comment/${id}/like`, { user: userData.username })
      console.log(data)
    } catch (error) {
      axiosError(error)
      toast({
        description: "You can't Like. It's a server error",
      })

    }


  }

  return (
    <Card className="border-none mt-6">
      <div className="grid grid-cols-12 gap-2 py-1">
        <div className="col-span-1 px-4 text-gray-500 ">{username}</div>
        <div className="col-span-11 grid ml-4  ">
          <div className="px-2 grid grid-flow-row  ">
            <div className="px-2 pt-2 grid grid-flow-row shadow-sm border rounded ">
              <div className="grid grid-cols-3">
                <div className="font-medium col-end-1 text-gray-500 ">{username}</div>
                <div className="font-thin col-start-1 ml-4">{time}</div>
              </div>
              <div className="py-3">
                {content}
              </div>
            </div>
            <div className="grid grid-cols-8 mt-[5px] p-1">
              <div className="text-gray-900 grid grid-flow-col w-[60px] ">
                <div
                  className="cursor-pointer" onClick={commentLikeHandler}>
                  <ThumbsUp size="17" className="mt-1" />

                </div>
                <div className="grid grid-flow-col pl-[7px]">
                  <div className="px-1">0</div>
                  <div className="font-light">likes</div>

                </div>
              </div>
              <div className=" ml-9 text-gray-900 grid  grid-flow-col w-[70px]">
                <div className="cursor-pointer" ><MessageSquare size="17" className="mt-[7px]" /></div>
                <div className="font-light text-gray-900">reply</div>

              </div>

            </div>
          </div>
        </div>
      </div>
    </Card>

  )
}
export const CustomIconWithText = ({ text, children }) => {
  return (
    <div className="font-medium text-gray-500 grid grid-flow-col  ">
      <div
        className="">
        {children}
      </div>
      <div className="ml-2 cursor-pointer">{text}</div>
    </div>
  )
}


export function CommentForm({ refetchComments }) {
  const commentData = useSelector((state: RootState) => state.commentReducer)
  const storyData = useSelector((state: RootState) => state.storyReducer)
  const userData = useSelector((state: RootState) => state.userReducer)
  const dispatch = useAppDispatch()
  const router = useRouter()
  const formSchema = z.object({
    comment: z.string().min(2, {
      message: "comment must be at least 2 characters.",
    }),
  })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comment: "",
    },
  })
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userData.username) {
      console.log("no user found")
      toast({
        title: "You are not logged in ",
        action: <ToastAction altText="Log In" onClick={() => { router.push("/profile/login") }}>Log in</ToastAction>
      })
      refetchComments()

      return
    }

    dispatch(addComment({ slug: storyData.slug, content: values.comment }))
    dispatch(getAllCommentOfaStory({ slug: storyData.slug }))



    form.resetField("comment")
    refetchComments()
  }

  return (<Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <FormField
        control={form.control}
        name="comment"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Textarea className="min-h-[20px]" {...form.register} placeholder="" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="submit">Publish</Button>
    </form>
  </Form>
  )
}

