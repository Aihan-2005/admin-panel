'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpDown, Loader2, Search } from 'lucide-react'

import { getLawyers } from '@/services/lawyer.service'
import { LawyerStatusBadge } from '@/components/lawyers/LawyerStatusBadge'
import type { Lawyer, LawyerState } from '@/types/lawyer'

type SortField = 'fullName' | 'state' | 'createdAt'
type SortDirection = 'asc' | 'desc'

const STATE_FILTER_OPTIONS: { value: LawyerState | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'همه وضعیت‌ها' },
  { value: 'PENDING_VERIFICATION', label: 'در انتظار احراز' },
  { value: 'ACTIVE', label: 'فعال' },
  { value: 'SUSPENDED', label: 'معلق' },
  { value: 'REJECTED', label: 'رد شده' },
]

export default function LawyersPage() {
  const [lawyers, setLawyers] = useState<Lawyer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [stateFilter, setStateFilter] = useState<LawyerState | 'ALL'>('ALL')
  const [sortField, setSortField] = useState<SortField>('fullName')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  useEffect(() => {
    let isMounted = true

    async function loadLawyers() {
      setIsLoading(true)
      const data = await getLawyers()
      if (isMounted) {
        setLawyers(data)
        setIsLoading(false)
      }
    }

    void loadLawyers()

    return () => {
      isMounted = false
    }
  }, [])

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredAndSortedLawyers = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase('fa-IR')

    const filtered = lawyers.filter((lawyer) => {
      const matchesQuery =
        !query ||
        lawyer.fullName.toLocaleLowerCase('fa-IR').includes(query) ||
        lawyer.phone.includes(query) ||
        lawyer.email.toLocaleLowerCase('fa-IR').includes(query)

      const matchesState = stateFilter === 'ALL' || lawyer.state === stateFilter

      return matchesQuery && matchesState
    })

    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0

      if (sortField === 'fullName') {
        comparison = a.fullName.localeCompare(b.fullName, 'fa-IR')
      } else if (sortField === 'state') {
        comparison = a.state.localeCompare(b.state)
      } else {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [lawyers, searchQuery, stateFilter, sortField, sortDirection])

  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">وکلا</h1>
        <p className="mt-1 text-sm text-zinc-500">
          لیست همه‌ی وکلای ثبت‌نام‌شده در دادیار
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search
            size={18}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="جستجو بر اساس نام، شماره یا ایمیل..."
            className="h-11 w-full rounded-xl border border-zinc-300 bg-white pr-10 pl-4 text-sm outline-none transition focus:border-zinc-700 focus:ring-2 focus:ring-zinc-200"
          />
        </div>

        <select
          value={stateFilter}
          onChange={(event) => setStateFilter(event.target.value as LawyerState | 'ALL')}
          className="h-11 rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-zinc-700 focus:ring-2 focus:ring-zinc-200"
        >
          {STATE_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-sm text-zinc-500">
            <Loader2 size={20} className="animate-spin" />
            در حال بارگذاری...
          </div>
        ) : filteredAndSortedLawyers.length === 0 ? (
          <div className="p-12 text-center text-sm text-zinc-400">
            هیچ وکیلی با این شرایط پیدا نشد.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50">
                <tr>
                  <th className="px-4 py-3 font-bold text-zinc-600">
                    <button
                      type="button"
                      onClick={() => toggleSort('fullName')}
                      className="flex items-center gap-1.5 hover:text-zinc-900"
                    >
                      نام و نام خانوادگی
                      <ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-bold text-zinc-600">شماره تماس</th>
                  <th className="px-4 py-3 font-bold text-zinc-600">تخصص</th>
                  <th className="px-4 py-3 font-bold text-zinc-600">
                    <button
                      type="button"
                      onClick={() => toggleSort('state')}
                      className="flex items-center gap-1.5 hover:text-zinc-900"
                    >
                      وضعیت وکیل
                      <ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-bold text-zinc-600">وضعیت اکانت</th>
                  <th className="px-4 py-3 font-bold text-zinc-600">
                    <button
                      type="button"
                      onClick={() => toggleSort('createdAt')}
                      className="flex items-center gap-1.5 hover:text-zinc-900"
                    >
                      تاریخ ثبت‌نام
                      <ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100">
                {filteredAndSortedLawyers.map((lawyer) => (
                  <tr key={lawyer.id} className="transition hover:bg-zinc-50">
                    <td className="px-4 py-3 font-semibold text-zinc-900">
                      {lawyer.fullName}
                    </td>
                    <td dir="ltr" className="px-4 py-3 text-left text-zinc-600">
                      {lawyer.phone}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{lawyer.specialization}</td>
                    <td className="px-4 py-3">
                      <LawyerStatusBadge state={lawyer.state} />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${
                          lawyer.accountStatus === 'ACTIVE'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-red-200 bg-red-50 text-red-700'
                        }`}
                      >
                        {lawyer.accountStatus === 'ACTIVE' ? 'فعال' : 'مسدود'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {new Date(lawyer.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/lawyers/${lawyer.id}`}
                        className="text-xs font-bold text-blue-700 hover:underline"
                      >
                        مشاهده
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}