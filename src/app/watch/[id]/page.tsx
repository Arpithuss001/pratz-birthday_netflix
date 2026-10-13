import { getVideo } from '@/actions/video'
import WatchClient from './WatchClient'
import { redirect } from 'next/navigation'

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const video = await getVideo(id)
  
  if (!video) {
    redirect('/browse')
  }

  return <WatchClient video={video} />
}
