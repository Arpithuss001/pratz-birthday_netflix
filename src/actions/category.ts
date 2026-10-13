'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getCategories() {
  return await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: {
      videos: {
        include: {
          video: true
        },
        orderBy: {
          order: 'asc'
        }
      }
    }
  })
}

export async function createCategory(data: { name: string; order?: number }) {
  const category = await prisma.category.create({
    data: {
      name: data.name,
      order: data.order ?? 0
    }
  })
  revalidatePath('/browse')
  revalidatePath('/admin')
  return category
}

export async function updateCategory(id: string, data: { name?: string; order?: number }) {
  const category = await prisma.category.update({
    where: { id },
    data
  })
  revalidatePath('/browse')
  revalidatePath('/admin')
  return category
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({
    where: { id }
  })
  revalidatePath('/browse')
  revalidatePath('/admin')
}
