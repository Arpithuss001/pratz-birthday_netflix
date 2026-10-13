'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getProfiles() {
  return await prisma.profile.findMany({
    orderBy: { createdAt: 'asc' }
  })
}

export async function createProfile(data: { name: string; avatarUrl: string }) {
  const profile = await prisma.profile.create({
    data
  })
  revalidatePath('/')
  revalidatePath('/profiles')
  revalidatePath('/admin')
  return profile
}

export async function updateProfile(id: string, data: { name?: string; avatarUrl?: string }) {
  const profile = await prisma.profile.update({
    where: { id },
    data
  })
  revalidatePath('/')
  revalidatePath('/profiles')
  revalidatePath('/admin')
  return profile
}

export async function deleteProfile(id: string) {
  await prisma.profile.delete({
    where: { id }
  })
  revalidatePath('/')
  revalidatePath('/profiles')
  revalidatePath('/admin')
}
