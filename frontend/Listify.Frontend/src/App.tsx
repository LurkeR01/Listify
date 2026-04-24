import { Navigate, Route, Routes } from "react-router-dom"
import { HomePage } from "@/pages/HomePage"
import { ListingsPage } from "@/pages/ListingsPage"
import { ListingDetailPage } from "@/pages/ListingDetailPage"
import { AuthPage } from "@/pages/AuthPage"
import { CreateListingPage } from "@/pages/CreateListingPage"
import { EditListingPage } from "@/pages/EditListingPage"
import { ProfilePage } from "@/pages/ProfilePage"
import { EditProfilePage } from "@/pages/EditProfilePage"
import { MyListingsPage } from "./pages/MyListingsPage"

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/listings" element={<ListingsPage />} />
      <Route path="/listings/:id" element={<ListingsPage />} />
      <Route path="/listing/:id" element={<ListingDetailPage />} />
      <Route path="/create" element={<CreateListingPage />} />
      <Route path="/my-listings/:id/edit" element={<EditListingPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/profile/edit" element={<EditProfilePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/my-listings" element={<MyListingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
