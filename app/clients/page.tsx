'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpDown, Loader2, Search } from 'lucide-react'

import { getClients } from '@/services/client.service'

import type {
  Client,
  ClientAccountStatus,
} from '@/types/client'

type SortField = 'fullName' | 'createdAt'
type SortDirection = 'asc' | 'desc'

const ACCOUNT_STATUS_FILTER_OPTIONS: {
  value: ClientAccountStatus | 'ALL'
  label: string
}[] = [
  { value: 'ALL', label: 'همه وضعیت‌ها' },
  { value: 'ACTIVE', label: 'فعال' },
  { value: 'SUSPENDED', label: 'مسدود' },
]

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')

  const [accountStatusFilter, setAccountStatusFilter] =
    useState<ClientAccountStatus | 'ALL'>('ALL')

  const [sortField, setSortField] =
    useState<SortField>('fullName')

  const [sortDirection, setSortDirection] =
    useState<SortDirection>('asc')

  useEffect(() => {
    let isMounted = true

    async function loadClients() {
      setIsLoading(true)

      const data = await getClients()

      if (isMounted) {
        setClients(data)
        setIsLoading(false)
      }
    }

    void loadClients()

    return () => {
      isMounted = false
    }
  }, [])

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((current) =>
        current === 'asc' ? 'desc' : 'asc',
      )
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredAndSortedClients = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLocaleLowerCase('fa-IR')

    const filtered = clients.filter((client) => {
      const matchesQuery =
        !query ||
        client.fullName
          .toLocaleLowerCase('fa-IR')
          .includes(query) ||
        client.phone.includes(query) ||
        client.email
          .toLocaleLowerCase('fa-IR')
          .includes(query)

      const matchesAccountStatus =
        accountStatusFilter === 'ALL' ||
        client.accountStatus === accountStatusFilter

      return matchesQuery && matchesAccountStatus
    })

    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0

      if (sortField === 'fullName') {
        comparison = a.fullName.localeCompare(
          b.fullName,
          'fa-IR',
        )
      } else {
        comparison =
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
      }

      return sortDirection === 'asc'
        ? comparison
        : -comparison
    })

    return sorted
  }, [
    clients,
    searchQuery,
    accountStatusFilter,
    sortField,
    sortDirection,
  ])

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}

      <div>
        <h1 className="text-xl font-bold text-zinc-900">
          موکلین
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          لیست همه‌ی موکلین ثبت‌نام‌شده در دادیار
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
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
            placeholder="جستجو بر اساس نام، شماره یا ایمیل..."
            className="h-11 w-full rounded-xl border border-zinc-300 bg-white pr-10 pl-4 text-sm outline-none transition focus:border-zinc-700 focus:ring-2 focus:ring-zinc-200"
          />
        </div>

        <select
          value={accountStatusFilter}
          onChange={(event) =>
            setAccountStatusFilter(
              event.target.value as ClientAccountStatus | 'ALL',
            )
          }
          className="h-11 rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-zinc-700 focus:ring-2 focus:ring-zinc-200"
        >
          {ACCOUNT_STATUS_FILTER_OPTIONS.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-sm text-zinc-500">
            <Loader2
              size={20}
              className="animate-spin"
            />

            در حال بارگذاری...
          </div>
        ) : filteredAndSortedClients.length === 0 ? (
          <div className="p-12 text-center text-sm text-zinc-400">
            هیچ موکلی با این شرایط پیدا نشد.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50">
                <tr>
                  <th className="px-4 py-3 font-bold text-zinc-600">
                    <button
                      type="button"
                      onClick={() =>
                        toggleSort('fullName')
                      }
                      className="flex items-center gap-1.5 hover:text-zinc-900"
                    >
                      نام و نام خانوادگی
                      <ArrowUpDown size={14} />
                    </button>
                  </th>

                  <th className="px-4 py-3 font-bold text-zinc-600">
                    شماره تماس
                  </th>

                  <th className="px-4 py-3 font-bold text-zinc-600">
                    ایمیل
                  </th>

                  <th className="px-4 py-3 font-bold text-zinc-600">
                    وضعیت اکانت
                  </th>

                  <th className="px-4 py-3 font-bold text-zinc-600">
                    <button
                      type="button"
                      onClick={() =>
                        toggleSort('createdAt')
                      }
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
                {filteredAndSortedClients.map((client) => (
                  <tr
                    key={client.id}
                    className="transition hover:bg-zinc-50"
                  >
                    <td className="px-4 py-3 font-semibold text-zinc-900">
                      {client.fullName}
                    </td>

                    <td
                      dir="ltr"
                      className="px-4 py-3 text-left text-zinc-600"
                    >
                      {client.phone}
                    </td>

                    <td
                      dir="ltr"
                      className="px-4 py-3 text-left text-zinc-600"
                    >
                      {client.email}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${
                          client.accountStatus === 'ACTIVE'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-red-200 bg-red-50 text-red-700'
                        }`}
                      >
                        {client.accountStatus === 'ACTIVE'
                          ? 'فعال'
                          : 'مسدود'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-zinc-500">
                      {new Date(
                        client.createdAt,
                      ).toLocaleDateString('fa-IR')}
                    </td>

                    <td className="px-4 py-3">
                      <Link
                        href={`/clients/${client.id}`}
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