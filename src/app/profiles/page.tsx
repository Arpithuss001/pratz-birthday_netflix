import { getProfiles } from '@/actions/profile'
import ProfilesClient from './ProfilesClient'

export default async function ProfilesPage() {
  const profiles = await getProfiles()
  
  return (
    <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full px-4 text-center">
        <h1 className="text-4xl md:text-5xl text-white mb-10">Who's watching?</h1>
        <ProfilesClient initialProfiles={profiles} />
      </div>
    </div>
  )
}
