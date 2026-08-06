export type VacancyStatus = 'open' | 'closed'

export type CandidateStatus =
  'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected'

export const CANDIDATE_STATUSES: CandidateStatus[] = [
  'new',
  'screening',
  'interview',
  'offer',
  'hired',
  'rejected',
]

export const CANDIDATE_STATUS_LABELS: Record<CandidateStatus, string> = {
  new: 'Новый',
  screening: 'На рассмотрении',
  interview: 'Собеседование',
  offer: 'Оффер',
  hired: 'Нанят',
  rejected: 'Отказ',
}

export interface Vacancy {
  id: string
  title: string
  description: string
  requirements: string
  location: string
  employment_type: string
  status: VacancyStatus
  created_at: string
}

export interface Candidate {
  id: string
  vacancy_id: string
  name: string
  email: string
  phone: string
  cover_letter: string | null
  portfolio_url: string | null
  resume_path: string
  status: CandidateStatus
  created_at: string
}
