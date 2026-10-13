import { getProfiles } from '@/actions/profile'
import { getVideos } from '@/actions/video'
import { getCategories } from '@/actions/category'
import AdminDashboard from './AdminDashboard'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminPage() {
  const profiles = await getProfiles()
  const videos = await getVideos()
  const categories = await getCategories()

  return <AdminDashboard profiles={profiles} videos={videos} categories={categories} />
}
