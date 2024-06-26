"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import axiosInstance from "@/lib/axios"

import Link from "next/link"
import { EachContact } from "./eachContact"
import { useSelector } from "react-redux"
import { type RootState } from "@/lib/store/store"
export type DataItem = {
  username: string,
  email: string,
}
export const ContactList: React.FC = () => {

  const [data, setData] = useState<DataItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const userData = useSelector((state: RootState) => state.userReducer)

  const divRef = useRef<HTMLDivElement>(null)
  const loadMoreData = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    try {
      const { data } = await axiosInstance.post(`/user/users?page=${page}`, { username: userData.username })
      setData((prevData) => [...prevData, ...data.users]);
      setPage((prevPage) => prevPage + 1);
      if (data.users.length === 0) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [page, loading]);

  useEffect(() => {
    const handleScroll = () => {
      if (divRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = divRef.current;

        console.log(scrollTop, scrollHeight, clientHeight)

        if (scrollTop + clientHeight >= scrollHeight - 5 && hasMore) {
          loadMoreData()
        }
      }
    };

    const divElem = divRef.current
    divElem?.addEventListener('scroll', handleScroll);
    return () => divElem?.removeEventListener('scroll', handleScroll);
  }, [loadMoreData, hasMore]);
  useEffect(() => {
    loadMoreData()
  }, [])



  return (
    <div ref={divRef} className="hidden md:flex md:flex-col min-w-2xl  p-4 py-6 bg-gray-50 dark:bg-gray-900 min-h-[75vh] max-h-[75vh] overflow-auto">
      <div className="flex items-center justify-between mb-4 ">
        <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-gray-400">Latest Chats</h5>
        <Link href="#" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500">
          View all
        </Link>

      </div>

      <div className="flow-root py-8  ">
        <ul className="divide-y  divide-gray-200 dark:divide-gray-700 ">
          {
            data.map(({ username, email }) => (

              <EachContact username={username} email={email} />
            ))
          }

        </ul>
      </div>

    </div >
  )
}
