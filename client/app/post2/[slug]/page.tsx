"use client"
import classNames from 'classnames'
import { type RootState, useAppDispatch } from '@/lib/store/store'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import axiosInstance from "@/lib/axios"
import axiosError from "@/lib/axiosError"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import CommentInPost from "./commentInPost"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@radix-ui/react-toast"
import { AxiosError, AxiosRequestConfig } from "axios"
import { countOfComment, countOfLike } from "@/lib/features/storySlice"
import { fetchPostUser } from "@/lib/features/postUserDetailsSlice"
import SaveStory from "./(helper)/saveStory"
import MainHeader from '@/components/nav/mainHeader'



export default function Page() {
  const storyData = useSelector((state: RootState) => state.storyReducer)
  const userData = useSelector((state: RootState) => state.userReducer)
  const commentData = useSelector((state: RootState) => state.commentReducer)
  const dispatch = useAppDispatch()
  const [liked, setLiked] = useState(false)
  const [content, setContent] = useState("")
  const [title, setTitle] = useState("")
  const [showDelete, setShowDelete] = useState(false)
  const [commentCount, setCommentCount] = useState(0)
  const [saveStoryCliked, setSaveStoryClicked] = useState<Boolean>(false)

  // console.log(storyData)

  async function commentClickHandler() {
    const commentBox = document.getElementById("comment-box")
    commentBox?.scrollIntoView({ behavior: "smooth" })
  }


  async function likeClickHandler() {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast({
          title: "you are not logged in",
          action: <ToastAction altText="Log In" onClick={() => { router.push("/profile/login") }}>Log in</ToastAction>
        })
        return
      }
      const headers = { "Authorization": `Bearer ${token}` }

      const { data: { message, isLiked } } = await axiosInstance.post<{ message: string, isLiked: boolean }>(`/story/${storyData.slug}/like`, {}, { headers: headers })



      console.log(message)

      setLiked(isLiked)

      const variant = isLiked ? "success" : "destructive"

      toast({
        description: `${message}`,
        variant: variant
      })




    } catch (err) {

      const error = err as AxiosError
      toast({
        description: "you cannot like now server error"
      })
      console.log("likeClickHandler " + error)
      axiosError(error)
      if (!userData.username) {
        toast({
          description: "You haven't logged in yet"
        })

      }
    }

  }
  async function forShowPostDelelte() {

    console.log("show delete")
    if (userData.username == storyData.author) {
      setShowDelete(true)
      console.log("user == author")

    }

  }

  async function fetchDetailStory() {
    try {
      const token = localStorage.getItem("token")

      //MEM I got error here cause localStorage was imported from persisted
      const headers = { "Authorization": `Bearer ${token}` }

      const { data: { story: { title, content, likeCount, commentCount }
      } } = await axiosInstance.post(`/story/${storyData.slug}`, {}, { headers: headers })
      // You have to give headers like this

      // console.log()

      setTitle(title)
      setContent(content)
      dispatch(countOfLike(likeCount))
      dispatch(countOfComment(commentCount))
      setCommentCount(commentCount)

    } catch (err) {
      const error = err as AxiosError
      console.log("fetchDetailStory " + error)
      axiosError(error)

    }
  }
  const postDeleteHandler = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.log("no token found")
        return
      }
      if (storyData.author !== userData.username) {
        console.log("story.author is not equals to user.username")
        return
      }
      const headers = { "Authorization": `Bearer ${token}` }

      const response = await axiosInstance.delete(`/story/${storyData.slug}/delete`, { headers: headers })
      console.log("got the response for delete")
      router.push("/")

    } catch (error) {

      console.log("postDeleteHandler " + error);

      axiosError(error as AxiosError)


    }

  }

  useEffect(() => {
    const fetchLikeStatus = async () => {

      try {
        const token = localStorage.getItem("token")

        const headers = { "Authorization": `Bearer ${token}` }

        const { data: response } = await axiosInstance.get<{ likeStatus: boolean, message: string }>(`/story/${storyData.slug}/likeStatus`, { headers: headers })
        console.log(response)

        setLiked(response.likeStatus)

      } catch (error) {

        console.log(error)
        axiosError(error as AxiosError)
      }
    }
    fetchLikeStatus()
  }, [liked])

  useEffect(() => {
    fetchDetailStory()
  }, [likeClickHandler, storyData.commentCount])

  useEffect(() => {
    forShowPostDelelte()
  }, [showDelete])


  useEffect(() => {
    setCommentCount(commentData?.commentList?.length)
    // console.log("new comment")
  }, [commentData])




  const router = useRouter()
  return (
    <div className=" overflow-y-clip ">
      <MainHeader />
      <div className=' min-h-screen '>
        <div className='grid grid-cols-12 w-8/12 mx-auto pt-6 gap-1  min-h-screen'>
          <section className=' col-start-1 col-end-3 grid justify-self-start left-section'>
            <div className="grid grid-rows-12 ">
              <div className="grid grid-flow-row h-[100px]  ">
                <div className="" >
                  <span className={classNames('cursor-pointer',
                    {
                      'dark:text-destructive font-bold': liked
                    })} onClick={() => likeClickHandler()}>{liked ? "liked" : "like"}</span>
                  <span className="ml-2">{storyData.likeCount}</span>
                </div>
                <div className="grid grid-flow-col gap-1">
                  <div onClick={commentClickHandler} className=" cursor-pointer">
                    Comment
                  </div>
                  <div>{commentCount}</div>

                </div>
                <SaveStory />              </div>
            </div>
          </section>
          <section className=' col-start-3 col-end-10 max-h-screen overflow-scroll main-content'>
            <div>
              <Card>
                <CardHeader>
                  <div className="grid grid-cols-9">

                    <CardTitle className=" col-span-8"> {title}</CardTitle>
                    <div className={classNames('cursor-pointer ', {
                      'invisible': !showDelete
                    })} onClick={postDeleteHandler}>delete</div>
                  </div>
                </CardHeader>
                <CardContent>
                  {content}
                </CardContent>
                <CardFooter>
                </CardFooter>
              </Card>
            </div>
            <CommentInPost />
          </section>
          <section className="col-start-11 col-end-13 max-h-screen right-section">
            <div className="col-start-11 col-end-13">
              <h2 className="scroll-m-20 text-xl font-semibold text-muted-foreground ">Author of the post</h2>
              <p className="scroll-m-20 text-2xl font-semibold tracking-tight cursor-pointer" onClick={() => {
                router.push("/profile")
                dispatch(fetchPostUser(storyData.author))
              }}>{storyData.author}</p>
            </div>

          </section>
        </div>
      </div>
    </div >


  )
}
