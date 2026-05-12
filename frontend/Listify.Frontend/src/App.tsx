import { Navigate, Route, Routes } from "react-router-dom"
import { HomePage } from "@/pages/HomePage"
import { ListingsPage } from "@/pages/ListingsPage"
import { ListingDetailPage } from "@/pages/ListingDetailPage"
import { AuthPage } from "@/pages/AuthPage"
import { CreateListingPage } from "@/pages/CreateListingPage"
import { EditListingPage } from "@/pages/EditListingPage"
import { MyProfilePage } from "@/pages/MyProfilePage"
import { EditProfilePage } from "@/pages/EditProfilePage"
import { ChatsPage } from "@/pages/ChatsPage"
import { MyListingsPage } from "./pages/MyListingsPage"
import { UserProfilePage } from "./pages/UserProfilePage"
import { ProfileRatingsPage } from "./pages/ProfileRatingsPage"

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/listings" element={<ListingsPage />} />
      <Route path="/listings/:id" element={<ListingsPage />} />
      <Route path="/listing/:id" element={<ListingDetailPage />} />
      <Route path="/create" element={<CreateListingPage />} />
      <Route path="/my-listings/:id/edit" element={<EditListingPage />} />
      <Route path="/profile" element={<MyProfilePage />} />
      <Route path="/profile/edit" element={<EditProfilePage />} />
      <Route path="/profile/ratings" element={<ProfileRatingsPage />} />
      <Route path="/chats" element={<ChatsPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/my-listings" element={<MyListingsPage />} />
      <Route path="/user-profile/:id" element={<UserProfilePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
