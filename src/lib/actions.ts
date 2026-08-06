'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { CandidateStatus, VacancyStatus } from '@/lib/types'

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get('email')),
    password: String(formData.get('password')),
  })

  if (error) {
    redirect('/admin/login?error=1')
  }

  redirect('/admin/vacancies')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

function vacancyFieldsFromForm(formData: FormData) {
  return {
    title: String(formData.get('title') ?? ''),
    description: String(formData.get('description') ?? ''),
    requirements: String(formData.get('requirements') ?? ''),
    location: String(formData.get('location') ?? ''),
    employment_type: String(formData.get('employment_type') ?? ''),
    status: (formData.get('status') as VacancyStatus) ?? 'open',
  }
}

export async function createVacancy(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('vacancies')
    .insert(vacancyFieldsFromForm(formData))

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/vacancies')
  revalidatePath('/')
  redirect('/admin/vacancies')
}

export async function updateVacancy(id: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('vacancies')
    .update(vacancyFieldsFromForm(formData))
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/vacancies')
  revalidatePath('/')
  redirect('/admin/vacancies')
}

export async function updateCandidateStatus(
  candidateId: string,
  formData: FormData,
) {
  const status = formData.get('status') as CandidateStatus
  const vacancyId = String(formData.get('vacancy_id'))

  const supabase = await createClient()
  const { error } = await supabase
    .from('candidates')
    .update({ status })
    .eq('id', candidateId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/admin/vacancies/${vacancyId}/candidates`)
}
