'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import Link from 'next/link'

import {
  ArrowUpDown,
  Search,
} from 'lucide-react'

import { AccountStatusBadge } from '@/components/common/AccountStatusBadge'

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/common/PageState'

import { getClients } from '@/services/client.service'

import type { Client } from '@/types/client'

import type {
  AccountStatus,
  SortDirection,
} from '@/types/common'

type SortField =
  | 'fullName'
  | 'createdAt'

export default function ClientsPage() {
  const [
    clients,
    setClients,
  ] = useState<Client[]>([])

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    )

  const [
    searchQuery,
    setSearchQuery,
  ] = useState('')

  const [
    accountStatusFilter,
    setAccountStatusFilter,
  ] = useState<
    AccountStatus | 'ALL'
  >('ALL')

  const [
    sortField,
    setSortField,
  ] =
    useState<SortField>(
      'fullName',
    )

  const [
    sortDirection,
    setSortDirection,
  ] =
    useState<SortDirection>(
      'asc',
    )

  useEffect(() => {
    let active = true

    getClients()
      .then((data) => {
        if (active) {
          setClients(data)
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'خطا در دریافت موکلین',
          )
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  const visibleClients =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLocaleLowerCase(
            'fa-IR',
          )

      return [...clients]
        .filter(
          (client) => {
            const matchesSearch =
              !query ||
              client.fullName
                .toLocaleLowerCase(
                  'fa-IR',
                )
                .includes(
                  query,
                ) ||
              client.phone.includes(
                query,
              ) ||
              client.email
                .toLocaleLowerCase(
                  'fa-IR',
                )
                .includes(
                  query,
                )

            const matchesStatus =
              accountStatusFilter ===
                'ALL' ||
              client.accountStatus ===
                accountStatusFilter

            return (
              matchesSearch &&
              matchesStatus
            )
          },
        )
        .sort((a, b) => {
          const comparison =
            sortField ===
            'fullName'
              ? a.fullName.localeCompare(
                  b.fullName,
                  'fa-IR',
                )
              : new Date(
                  a.createdAt,
                ).getTime() -
                new Date(
                  b.createdAt,
                ).getTime()

          return sortDirection ===
            'asc'
            ? comparison
            : -comparison
        })
    }, [
      clients,
      searchQuery,
      accountStatusFilter,
      sortField,
      sortDirection,
    ])

  function toggleSort(
    field: SortField,
  ) {
    if (
      field === sortField
    ) {
      setSortDirection(
        (value) =>
          value === 'asc'
            ? 'desc'
            : 'asc',
      )
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  return (
    <div
      dir="rtl"
      className="space-y-6"
    >
      <div>
        <h1 className="text-xl font-black text-zinc-900">
          موکلین
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          همه موکل‌هایی که در
          سامانه ثبت‌نام کرده‌اند
        </p>
      </div>

      {error && (
        <ErrorState
          message={error}
        />
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-md">
          <Search
            size={18}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />

          <input
            value={
              searchQuery
            }
            onChange={(e) =>
              setSearchQuery(
                e.target.value,
              )
            }
            placeholder="جستجو بر اساس نام، شماره یا ایمیل..."
            className="h-11 w-full rounded-xl border border-zinc-300 bg-white pr-10 pl-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <select
          value={
            accountStatusFilter
          }
          onChange={(e) =>
            setAccountStatusFilter(
              e.target
                .value as
                | AccountStatus
                | 'ALL',
            )
          }
          className="h-11 rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="ALL">
            همه وضعیت‌ها
          </option>

          <option value="ACTIVE">
            فعال
          </option>

          <option value="SUSPENDED">
            مسدود
          </option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        {isLoading ? (
          <LoadingState />
        ) : visibleClients.length ===
          0 ? (
          <EmptyState message="هیچ موکلی پیدا نشد." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-right text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50">
                <tr>
                  <th className="px-4 py-3 font-bold text-zinc-600">
                    <button
                      onClick={() =>
                        toggleSort(
                          'fullName',
                        )
                      }
                      className="flex items-center gap-1.5"
                    >
                      نام و نام
                      خانوادگی

                      <ArrowUpDown
                        size={
                          14
                        }
                      />
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
                      onClick={() =>
                        toggleSort(
                          'createdAt',
                        )
                      }
                      className="flex items-center gap-1.5"
                    >
                      تاریخ ثبت‌نام

                      <ArrowUpDown
                        size={
                          14
                        }
                      />
                    </button>
                  </th>

                  <th className="px-4 py-3" />
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100">
                {visibleClients.map(
                  (client) => (
                    <tr
                      key={
                        client.id
                      }
                      className="hover:bg-zinc-50"
                    >
                      <td className="px-4 py-3 font-semibold">
                        {
                          client.fullName
                        }
                      </td>

                      <td
                        dir="ltr"
                        className="px-4 py-3 text-left text-zinc-600"
                      >
                        {
                          client.phone
                        }
                      </td>

                      <td
                        dir="ltr"
                        className="px-4 py-3 text-left text-zinc-600"
                      >
                        {
                          client.email
                        }
                      </td>

                      <td className="px-4 py-3">
                        <AccountStatusBadge
                          status={
                            client.accountStatus
                          }
                        />
                      </td>

                      <td className="px-4 py-3 text-zinc-500">
                        {new Date(
                          client.createdAt,
                        ).toLocaleDateString(
                          'fa-IR',
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <Link
                          href={`/clients/${client.id}`}
                          className="text-xs font-bold text-blue-700 hover:underline"
                        >
                          مدیریت
                        </Link>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}