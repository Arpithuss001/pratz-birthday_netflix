import { getCategories } from '@/actions/category'
import { getVideos } from '@/actions/video'
import BrowseClient from './BrowseClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function BrowsePage() {
  const categories = await getCategories()
  const videos = await getVideos()
  
  return <BrowseClient categories={categories} allVideos={videos} />
}
