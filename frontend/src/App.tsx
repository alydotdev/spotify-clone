
import { Routes , Route } from "react-router-dom"
import HomePage from "./Pages/home/HomePage"
import AuthCallbackPage from "./Pages/auth-callback/AuthCallbackPage"
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react"
import MainLayout from "./layout/MainLayout"
import ChatPage from "./Pages/chat/ChatPage"
import AlbumPage from "./Pages/album/AlbumPage"
import AdminPage from "./Pages/admin/AdminPage"
import SearchPage from "./Pages/search/SearchPage"
import { Toaster } from "react-hot-toast";
import NotFoundPage from "./Pages/404/NotFoundPage"
const App = () => {
  return (
    <>
    <Routes>
      <Route path="/sso-callback" element={<AuthenticateWithRedirectCallback signUpForceRedirectUrl={"/auth-callback"}/>}/>
      <Route path="/auth-callback" element={<AuthCallbackPage/>}/>
      <Route path="/admin" element={<AdminPage/>}/>
      <Route element={<MainLayout/>}>
            <Route path="/" element={<HomePage/>}/>
            <Route path="/search" element={<SearchPage/>}/>
            <Route path="/chat" element={<ChatPage/>}/>
            <Route path="/albums/:albumId" element={<AlbumPage/>}/>
            <Route path="*" element={<NotFoundPage/>}/>
      </Route>
    </Routes>
    <Toaster />
    </>
  )
}

export default App