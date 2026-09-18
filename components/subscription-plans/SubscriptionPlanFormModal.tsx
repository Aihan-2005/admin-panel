'use client'

import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Check,
  CheckCircle2,
  Info,
  Loader2,
  Package,
  Plus,
  X,
} from 'lucide-react'

import type {
  SubscriptionPlan,
  SubscriptionPlanOptions,
  SubscriptionPlanPayload,
} from '@/types/subscription-plan'


interface SubscriptionPlanFormModalProps {
  open:
    boolean

  plan:
    SubscriptionPlan | null

  options:
    SubscriptionPlanOptions

  saving:
    boolean

  onClose:
    () => void

  onSubmit:
    (
      input:
        SubscriptionPlanPayload,
    ) =>
      void |
      Promise<void>
}


interface FormState {
  title:
    string

  description:
    string

  tier:
    string

  tags:
    string

  durationMonths:
    string

  price:
    string

  discountPercent:
    string

  features:
    string[]

  isActive:
    boolean

  sortOrder:
    string
}


const TIER_LABELS:
  Record<
    string,
    string
  > = {
    BASIC:
      'پایه',

    STANDARD:
      'استاندارد',

    PREMIUM:
      'حرفه‌ای',
  }


const INPUT_CLASS =
  'h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold text-zinc-900 outline-none transition placeholder:font-normal placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-zinc-100'


const TEXTAREA_CLASS =
  'w-full resize-y rounded-xl border border-zinc-300 bg-white p-3 text-sm font-semibold leading-7 text-zinc-900 outline-none transition placeholder:font-normal placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-zinc-100'


function createInitialState(
  plan:
    SubscriptionPlan | null,

  options:
    SubscriptionPlanOptions,
): FormState {
  if (
    plan
  ) {
    return {
      title:
        plan.title,

      description:
        plan.description,

      tier:
        plan.tier,

      tags:
        plan.tags.join(
          '، ',
        ),

      durationMonths:
        String(
          plan.durationMonths,
        ),

      price:
        String(
          plan.price,
        ),

      discountPercent:
        String(
          plan.discountPercent,
        ),

      features: [
        ...plan.features,
      ],

      isActive:
        plan.isActive,

      sortOrder:
        String(
          plan.sortOrder,
        ),
    }
  }


  return {
    title:
      '',

    description:
      '',

    tier:
      options.tiers[0] ??
      '',

    tags:
      '',

    durationMonths:
      '1',

    price:
      '0',

    discountPercent:
      '0',

    features:
      [],

    isActive:
      true,

    sortOrder:
      '0',
  }
}


function parseInteger(
  value:
    string,
): number | null {
  const normalized =
    value.trim()


  if (
    !/^\d+$/.test(
      normalized,
    )
  ) {
    return null
  }


  const parsed =
    Number(
      normalized,
    )


  return Number.isSafeInteger(
    parsed,
  )
    ? parsed
    : null
}


function parseTags(
  value:
    string,
): string[] {
  const normalized =
    value
      .split(
        /[,،]/,
      )
      .map(
        (
          item,
        ) =>
          item.trim(),
      )
      .filter(
        Boolean,
      )


  const result:
    string[] = []

  const seen =
    new Set<string>()


  for (
    const tag of normalized
  ) {
    const key =
      tag.toLocaleLowerCase()


    if (
      seen.has(
        key,
      )
    ) {
      continue
    }


    seen.add(
      key,
    )

    result.push(
      tag,
    )
  }


  return result
}


export default function SubscriptionPlanFormModal({
  open,
  plan,
  options,
  saving,
  onClose,
  onSubmit,
}: SubscriptionPlanFormModalProps) {
  const [
    form,
    setForm,
  ] =
    useState<FormState>(
      () =>
        createInitialState(
          plan,
          options,
        ),
    )


  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    )


  useEffect(
    () => {
      if (
        !open
      ) {
        return
      }


      setForm(
        createInitialState(
          plan,
          options,
        ),
      )

      setError(
        null,
      )
    },

    [
      open,
      plan,
      options,
    ],
  )


  useEffect(
    () => {
      if (
        !open
      ) {
        return
      }


      const previousOverflow =
        document.body.style
          .overflow


      const handleKeyDown =
        (
          event:
            KeyboardEvent,
        ) => {
          if (
            event.key ===
              'Escape' &&
            !saving
          ) {
            onClose()
          }
        }


      document.body.style
        .overflow =
        'hidden'


      window.addEventListener(
        'keydown',
        handleKeyDown,
      )


      return () => {
        document.body.style
          .overflow =
          previousOverflow


        window.removeEventListener(
          'keydown',
          handleKeyDown,
        )
      }
    },

    [
      open,
      saving,
      onClose,
    ],
  )


  const validFeatureCodes =
    useMemo(
      () =>
        new Set(
          options.features.map(
            (
              feature,
            ) =>
              feature.code,
          ),
        ),

      [
        options.features,
      ],
    )


  if (
    !open
  ) {
    return null
  }


  function setField<
    Key extends keyof FormState
  >(
    key:
      Key,

    value:
      FormState[Key],
  ) {
    setForm(
      (
        current,
      ) => ({
        ...current,

        [key]:
          value,
      }),
    )

    setError(
      null,
    )
  }


  function toggleFeature(
    code:
      string,
  ) {
    setForm(
      (
        current,
      ) => {
        const exists =
          current.features
            .includes(
              code,
            )


        return {
          ...current,

          features:
            exists
              ? current.features
                  .filter(
                    (
                      item,
                    ) =>
                      item !==
                      code,
                  )
              : [
                  ...current.features,
                  code,
                ],
        }
      },
    )

    setError(
      null,
    )
  }


  async function handleSubmit(
    event:
      FormEvent,
  ) {
    event.preventDefault()


    if (
      saving
    ) {
      return
    }


    const title =
      form.title.trim()


    const description =
      form.description.trim()


    if (
      !title
    ) {
      setError(
        'عنوان پلن را وارد کنید.',
      )

      return
    }


    if (
      title.length >
      120
    ) {
      setError(
        'عنوان پلن نمی‌تواند بیشتر از ۱۲۰ کاراکتر باشد.',
      )

      return
    }


    if (
      !description
    ) {
      setError(
        'توضیحات پلن را وارد کنید.',
      )

      return
    }


    if (
      description.length >
      2000
    ) {
      setError(
        'توضیحات پلن نمی‌تواند بیشتر از ۲۰۰۰ کاراکتر باشد.',
      )

      return
    }


    if (
      !options.tiers.includes(
        form.tier,
      )
    ) {
      setError(
        'سطح انتخاب‌شده توسط Backend معتبر نیست.',
      )

      return
    }


    const tags =
      parseTags(
        form.tags,
      )


    if (
      tags.length >
      10
    ) {
      setError(
        'حداکثر ۱۰ برچسب قابل ثبت است.',
      )

      return
    }


    if (
      tags.some(
        (
          tag,
        ) =>
          tag.length >
          50,
      )
    ) {
      setError(
        'هر برچسب حداکثر می‌تواند ۵۰ کاراکتر باشد.',
      )

      return
    }


    const durationMonths =
      parseInteger(
        form.durationMonths,
      )


    if (
      durationMonths ===
        null ||
      durationMonths <
        1 ||
      durationMonths >
        120
    ) {
      setError(
        'مدت پلن باید عددی صحیح بین ۱ تا ۱۲۰ ماه باشد.',
      )

      return
    }


    const price =
      parseInteger(
        form.price,
      )


    if (
      price ===
        null ||
      price <
        0
    ) {
      setError(
        'قیمت باید یک عدد صحیح صفر یا بزرگ‌تر باشد.',
      )

      return
    }


    const discountPercent =
      parseInteger(
        form.discountPercent,
      )


    if (
      discountPercent ===
        null ||
      discountPercent <
        0 ||
      discountPercent >
        100
    ) {
      setError(
        'درصد تخفیف باید بین صفر تا ۱۰۰ باشد.',
      )

      return
    }


    const sortOrder =
      parseInteger(
        form.sortOrder,
      )


    if (
      sortOrder ===
        null ||
      sortOrder <
        0
    ) {
      setError(
        'اولویت نمایش باید یک عدد صحیح صفر یا بزرگ‌تر باشد.',
      )

      return
    }


    const features =
      Array.from(
        new Set(
          form.features,
        ),
      )


    if (
      features.length ===
      0
    ) {
      setError(
        'حداقل یک قابلیت برای پلن انتخاب کنید.',
      )

      return
    }


    if (
      features.some(
        (
          code,
        ) =>
          !validFeatureCodes
            .has(
              code,
            ),
      )
    ) {
      setError(
        'یکی از قابلیت‌های انتخاب‌شده دیگر توسط Backend پشتیبانی نمی‌شود.',
      )

      return
    }


    await onSubmit({
      title,

      description,

      tier:
        form.tier,

      tags,

      durationMonths,

      price,

      discountPercent,

      features,

      isActive:
        form.isActive,

      sortOrder,
    })
  }


  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={() => {
        if (
          !saving
        ) {
          onClose()
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscription-plan-modal-title"
        onMouseDown={(
          event,
        ) =>
          event.stopPropagation()
        }
        className="flex max-h-[96dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-zinc-200 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
              <Package
                size={21}
              />
            </div>

            <div>
              <p className="text-xs font-black text-violet-700">
                مدیریت اشتراک
              </p>

              <h2
                id="subscription-plan-modal-title"
                className="mt-1 text-xl font-black text-zinc-950"
              >
                {
                  plan
                    ? 'ویرایش پلن اشتراکی'
                    : 'ساخت پلن اشتراکی'
                }
              </h2>

              <p className="mt-1 text-xs font-semibold text-zinc-500">
                tier و featureها مستقیماً از Backend دریافت شده‌اند.
              </p>
            </div>
          </div>


          <button
            type="button"
            disabled={
              saving
            }
            onClick={
              onClose
            }
            aria-label="بستن"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-100 disabled:opacity-50"
          >
            <X
              size={20}
            />
          </button>
        </header>


        <form
          onSubmit={
            handleSubmit
          }
          className="min-h-0 flex-1 overflow-y-auto"
        >
          <div className="space-y-6 p-5 sm:p-6">
            <section>
              <SectionTitle>
                اطلاعات اصلی
              </SectionTitle>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="عنوان پلن">
                  <input
                    value={
                      form.title
                    }
                    onChange={(
                      event,
                    ) =>
                      setField(
                        'title',
                        event.target.value,
                      )
                    }
                    disabled={
                      saving
                    }
                    maxLength={
                      120
                    }
                    placeholder="مثلاً پلن پایه"
                    className={
                      INPUT_CLASS
                    }
                  />
                </Field>


                <Field label="سطح پلن">
                  <select
                    value={
                      form.tier
                    }
                    onChange={(
                      event,
                    ) =>
                      setField(
                        'tier',
                        event.target.value,
                      )
                    }
                    disabled={
                      saving
                    }
                    className={
                      INPUT_CLASS
                    }
                  >
                    {
                      options.tiers.map(
                        (
                          tier,
                        ) => (
                          <option
                            key={
                              tier
                            }
                            value={
                              tier
                            }
                          >
                            {
                              TIER_LABELS[
                                tier
                              ]
                                ? `${TIER_LABELS[tier]} — ${tier}`
                                : tier
                            }
                          </option>
                        ),
                      )
                    }
                  </select>
                </Field>
              </div>


              <div className="mt-4">
                <Field label="توضیحات">
                  <textarea
                    value={
                      form.description
                    }
                    onChange={(
                      event,
                    ) =>
                      setField(
                        'description',
                        event.target.value,
                      )
                    }
                    disabled={
                      saving
                    }
                    rows={
                      4
                    }
                    maxLength={
                      2000
                    }
                    placeholder="توضیحی که برای این پلن نمایش داده می‌شود..."
                    className={
                      TEXTAREA_CLASS
                    }
                  />
                </Field>
              </div>


              <div className="mt-4">
                <Field
                  label="برچسب‌ها"
                  hint="با ویرگول فارسی یا انگلیسی جدا کنید؛ حداکثر ۱۰ مورد."
                >
                  <input
                    value={
                      form.tags
                    }
                    onChange={(
                      event,
                    ) =>
                      setField(
                        'tags',
                        event.target.value,
                      )
                    }
                    disabled={
                      saving
                    }
                    placeholder="پیشنهادی، محبوب، مناسب شروع"
                    className={
                      INPUT_CLASS
                    }
                  />
                </Field>
              </div>
            </section>


            <section className="border-t border-zinc-200 pt-6">
              <SectionTitle>
                مدت، قیمت و نمایش
              </SectionTitle>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="مدت اشتراک (ماه)">
                  <input
                    type="number"
                    min={
                      1
                    }
                    max={
                      120
                    }
                    step={
                      1
                    }
                    value={
                      form.durationMonths
                    }
                    onChange={(
                      event,
                    ) =>
                      setField(
                        'durationMonths',
                        event.target.value,
                      )
                    }
                    disabled={
                      saving
                    }
                    className={
                      INPUT_CLASS
                    }
                  />
                </Field>


                <Field label="قیمت">
                  <input
                    type="number"
                    min={
                      0
                    }
                    step={
                      1
                    }
                    value={
                      form.price
                    }
                    onChange={(
                      event,
                    ) =>
                      setField(
                        'price',
                        event.target.value,
                      )
                    }
                    disabled={
                      saving
                    }
                    className={
                      INPUT_CLASS
                    }
                  />
                </Field>


                <Field label="درصد تخفیف">
                  <input
                    type="number"
                    min={
                      0
                    }
                    max={
                      100
                    }
                    step={
                      1
                    }
                    value={
                      form.discountPercent
                    }
                    onChange={(
                      event,
                    ) =>
                      setField(
                        'discountPercent',
                        event.target.value,
                      )
                    }
                    disabled={
                      saving
                    }
                    className={
                      INPUT_CLASS
                    }
                  />
                </Field>


                <Field
                  label="اولویت نمایش"
                  hint="عدد کمتر زودتر نمایش داده می‌شود."
                >
                  <input
                    type="number"
                    min={
                      0
                    }
                    step={
                      1
                    }
                    value={
                      form.sortOrder
                    }
                    onChange={(
                      event,
                    ) =>
                      setField(
                        'sortOrder',
                        event.target.value,
                      )
                    }
                    disabled={
                      saving
                    }
                    className={
                      INPUT_CLASS
                    }
                  />
                </Field>
              </div>
            </section>


            <section className="border-t border-zinc-200 pt-6">
              <div className="flex items-center justify-between gap-4">
                <SectionTitle>
                  قابلیت‌های پلن
                </SectionTitle>

                <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-black text-violet-700">
                  {
                    form.features.length
                      .toLocaleString(
                        'fa-IR',
                      )
                  }
                  {' '}
                  انتخاب‌شده
                </span>
              </div>


              <p className="mt-2 text-xs font-semibold leading-6 text-zinc-500">
                فقط codeهایی که Backend از endpoint options برگردانده قابل انتخاب هستند.
              </p>


              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {
                  options.features.map(
                    (
                      feature,
                    ) => {
                      const selected =
                        form.features.includes(
                          feature.code,
                        )


                      return (
                        <button
                          key={
                            feature.code
                          }
                          type="button"
                          disabled={
                            saving
                          }
                          title={
                            feature.description
                          }
                          onClick={() =>
                            toggleFeature(
                              feature.code,
                            )
                          }
                          className={`group relative min-h-28 rounded-2xl border p-4 text-right transition ${
                            selected
                              ? 'border-violet-400 bg-violet-50 ring-2 ring-violet-100'
                              : 'border-zinc-200 bg-white hover:border-violet-200 hover:bg-violet-50/40'
                          } disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-black text-zinc-950">
                                {
                                  feature.title
                                }
                              </p>

                              <p
                                dir="ltr"
                                className="mt-1 truncate text-right text-[11px] font-bold text-violet-600"
                              >
                                {
                                  feature.code
                                }
                              </p>
                            </div>


                            <span
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
                                selected
                                  ? 'border-violet-600 bg-violet-600 text-white'
                                  : 'border-zinc-300 bg-white text-transparent'
                              }`}
                            >
                              <Check
                                size={16}
                              />
                            </span>
                          </div>


                          {
                            feature.description &&
                            (
                              <div className="mt-3 flex items-start gap-1.5 text-xs font-semibold leading-6 text-zinc-500">
                                <Info
                                  size={14}
                                  className="mt-1 shrink-0"
                                />

                                <span>
                                  {
                                    feature.description
                                  }
                                </span>
                              </div>
                            )
                          }
                        </button>
                      )
                    },
                  )
                }
              </div>
            </section>


            <section className="border-t border-zinc-200 pt-6">
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div>
                  <p className="font-black text-zinc-900">
                    پلن فعال باشد
                  </p>

                  <p className="mt-1 text-xs font-semibold leading-6 text-zinc-500">
                    پلن فعال در endpoint عمومی قابل مشاهده و برای استفاده جدید در دسترس خواهد بود.
                  </p>
                </div>


                <input
                  type="checkbox"
                  checked={
                    form.isActive
                  }
                  disabled={
                    saving
                  }
                  onChange={(
                    event,
                  ) =>
                    setField(
                      'isActive',
                      event.target.checked,
                    )
                  }
                  className="h-5 w-5 shrink-0 accent-blue-600"
                />
              </label>
            </section>


            {
              error &&
              (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-6 text-red-700">
                  {
                    error
                  }
                </div>
              )
            }
          </div>


          <footer className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-zinc-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
            <button
              type="button"
              disabled={
                saving
              }
              onClick={
                onClose
              }
              className="h-11 rounded-xl border border-zinc-300 bg-white px-5 text-sm font-black text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
            >
              انصراف
            </button>


            <button
              type="submit"
              disabled={
                saving
              }
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {
                saving
                  ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )
                  : plan
                    ? (
                      <CheckCircle2
                        size={17}
                      />
                    )
                    : (
                      <Plus
                        size={17}
                      />
                    )
              }

              {
                saving
                  ? 'در حال ذخیره...'
                  : plan
                    ? 'ذخیره تغییرات'
                    : 'ساخت پلن'
              }
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}


function SectionTitle({
  children,
}: {
  children:
    React.ReactNode
}) {
  return (
    <h3 className="font-black text-zinc-950">
      {
        children
      }
    </h3>
  )
}


function Field({
  label,
  hint,
  children,
}: {
  label:
    string

  hint?:
    string

  children:
    React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black text-zinc-600">
        {
          label
        }
      </span>

      {
        children
      }

      {
        hint &&
        (
          <span className="mt-1.5 block text-[11px] font-semibold leading-5 text-zinc-400">
            {
              hint
            }
          </span>
        )
      }
    </label>
  )
}