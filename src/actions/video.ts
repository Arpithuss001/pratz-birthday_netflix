'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getVideos() {
  return await prisma.video.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      categories: {
        include: {
          category: true
        }
      }
    }
  })
}

export async function getVideo(id: string) {
  return await prisma.video.findUnique({
    where: { id },
    include: {
      categories: {
        include: {
          category: true
        }
      }
    }
  })
}

export async function createVideo(data: {
  title: string
  description: string
  thumbnailUrl: string
  videoUrl: string
  genre?: string
  categoryIds?: string[]
}) {
  const { categoryIds, ...videoData } = data
  const video = await prisma.video.create({
    data: videoData
  })

  // If no category was explicitly selected, automatically assign to default/first category!
  let targetCategoryIds = categoryIds && categoryIds.length > 0 ? categoryIds : []
  if (targetCategoryIds.length === 0) {
    const defaultCat = await prisma.category.findFirst()
    if (defaultCat) {
      targetCategoryIds = [defaultCat.id]
    }
  }

  if (targetCategoryIds.length > 0) {
    await Promise.all(targetCategoryIds.map(categoryId => 
      prisma.categoryVideo.create({
        data: {
          categoryId,
          videoId: video.id
        }
      })
    ))
  }

  revalidatePath('/browse')
  revalidatePath('/admin')
  return video
}

export async function updateVideo(id: string, data: {
  title?: string
  description?: string
  thumbnailUrl?: string
  videoUrl?: string
  genre?: string
}) {
  const video = await prisma.video.update({
    where: { id },
    data
  })
  
  revalidatePath('/browse')
  revalidatePath('/admin')
  return video
}

export async function deleteVideo(id: string) {
  await prisma.video.delete({
    where: { id }
  })
  
  revalidatePath('/browse')
  revalidatePath('/admin')
}

export async function setVideoCategories(videoId: string, categoryIds: string[]) {
  // First remove existing
  await prisma.categoryVideo.deleteMany({
    where: { videoId }
  })
  
  // Then add new
  if (categoryIds.length > 0) {
    await Promise.all(categoryIds.map(categoryId => 
      prisma.categoryVideo.create({
        data: {
          categoryId,
          videoId
        }
      })
    ))
  }
  
  revalidatePath('/browse')
  revalidatePath('/admin')
}

export async function toggleVideoCategory(videoId: string, categoryId: string) {
  const existing = await prisma.categoryVideo.findUnique({
    where: {
      categoryId_videoId: { categoryId, videoId }
    }
  })

  if (existing) {
    await prisma.categoryVideo.delete({
      where: {
        categoryId_videoId: { categoryId, videoId }
      }
    })
  } else {
    await prisma.categoryVideo.create({
      data: {
        categoryId,
        videoId
      }
    })
  }

  revalidatePath('/browse')
  revalidatePath('/admin')
}

