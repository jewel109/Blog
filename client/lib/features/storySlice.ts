import axiosInstance from "@/lib/axios";
import axiosError from "@/lib/axiosError";
import { createAsyncThunk, createSlice, current, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

interface Story {
  author: string,
  slug: string,
  title: string,
  content: string,
  success: boolean,
  liked: boolean,
  likes: number,
  likeCount: number,
  commentCount: number,
  loading: boolean,
  error: string | null,

}
const initialState: Story = {
  author: "",
  slug: "",
  title: "",
  content: "",
  success: false,
  liked: false,
  likes: 0,
  likeCount: 0,
  commentCount: 0,
  loading: false,
  error: null,

}
export const addStory = createAsyncThunk("addStory", async ({ title, content }: { title: string, content: string }) => {
  try {
    const token = localStorage.getItem("token") ?? null

    const headers = { "Authorization": `Bearer ${token}` }

    const { data } = await axiosInstance.post("/story/addStory", { title, content }, { headers: headers })

    console.log(data)
    const postData = data.data.content ?? "no data"
    return postData
  } catch (error) {
    console.log("addStory " + error)
    axiosError(error as AxiosError)
  }
})

export const fetchAllStories = createAsyncThunk("story", async () => {
  try {
    const { data } = await axiosInstance.get("/story/getAllStories")
    console.log(data.query)
    if (!data) {
      throw new Error("no response found")
    } else if (!data.query) {
      throw new Error("response have no query")
    } else {
      return data.query
    }
  } catch (err) {
    const error = err as AxiosError
    console.log("fetchAllStories " + error)
    axiosError(error)
  }

})

export const storySlice = createSlice({
  name: "story",
  initialState,
  reducers: {
    fetchSlug(state, action) {
      state.slug = action.payload
      console.log(current(state))
    },
    fetchUser(state, action) {
      state.author = action.payload
    },
    isLiked(state, action) {
      state.liked = action.payload
      console.log(current(state))
    },
    countOfLike(state, action) {
      state.likeCount = action.payload
    },
    countOfComment(state, { payload }) {
      state.commentCount = payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllStories.pending, (state: Story) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        console.log(state)
      })
      .addCase(fetchAllStories.fulfilled, (state: Story, { payload }: PayloadAction<void>) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(fetchAllStories.rejected, (state: Story, action) => {
        state.loading = false;
        state.error = "regjected";
        console.log(state)
      });

  },

})
export const { fetchSlug, fetchUser, countOfComment, countOfLike, isLiked } = storySlice.actions
export default storySlice.reducer 
