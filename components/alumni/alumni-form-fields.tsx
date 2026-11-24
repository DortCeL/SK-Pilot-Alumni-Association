"use client";

import { useEffect, useMemo } from "react";
import type {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { Controller } from "react-hook-form";
import {
  BD_DIVISIONS,
  GROUP_OPTIONS,
  OVERSEAS_COUNTRIES,
  PASSING_YEARS,
} from "@/lib/constants";
import {
  DISTRICTS_BY_DIVISION,
  districtLabel,
} from "@/lib/divisions-districts";
import { useLang, useMessages } from "@/components/language";
import {
  FormField,
  inputClassName,
  sectionClassName,
} from "@/components/ui/form-field";
import { ImageUploadField } from "@/components/alumni/image-upload-field";
import type { AlumniRegistrationInput } from "@/lib/validations/alumni";

type FormShape = AlumniRegistrationInput;

type Props = {
  register: UseFormRegister<FormShape>;
  control: Control<FormShape>;
  errors: FieldErrors<FormShape>;
  watch: UseFormWatch<FormShape>;
  setValue: UseFormSetValue<FormShape>;
  mode: "register" | "edit";
  lockPhone?: boolean;
  publicUpload?: boolean;
};

export function AlumniFormFields({
  register,
  control,
  errors,
  watch,
  setValue,
  mode,
  lockPhone,
  publicUpload,
}: Props) {
  const m = useMessages();
  const lang = useLang();
  const regionType = watch("address.regionType");
  const division = watch("address.division");
  const country = watch("address.country");
  const mobilePhone = watch("mobilePhone");
  const whatsappSameAsMobile = watch("whatsappSameAsMobile");
  const addressErrors = errors.address as
    | {
        division?: { message?: string };
        district?: { message?: string };
        country?: { message?: string };
        customCountry?: { message?: string };
        stateOrRegion?: { message?: string };
      }
    | undefined;

  const districts = useMemo(() => {
    if (regionType !== "bangladesh" || !division) return [];
    return DISTRICTS_BY_DIVISION[division] ?? [];
  }, [division, regionType]);

  useEffect(() => {
    if (whatsappSameAsMobile) {
      setValue("whatsappPhone", mobilePhone ?? "", { shouldValidate: true });
    }
  }, [whatsappSameAsMobile, mobilePhone, setValue]);

  return (
    <div className="flex flex-col gap-8">
      <section className={sectionClassName}>
        <h2 className="mb-1 text-xl font-semibold text-ink">
          {m.sectionPersonal}
        </h2>
        <p className="mb-5 text-sm text-muted">{m.sectionPersonalHint}</p>
        <div className="grid gap-5">
          <Controller
            control={control}
            name="profilePhotoUrl"
            render={({ field }) => (
              <ImageUploadField
                label={m.photo}
                required
                hint={m.photoHint}
                folder="profile"
                publicUpload={publicUpload}
                valueUrl={field.value}
                error={errors.profilePhotoUrl?.message}
                onUploaded={({ url, publicId }) => {
                  setValue("profilePhotoUrl", url, { shouldValidate: true });
                  setValue("profilePhotoPublicId", publicId, {
                    shouldValidate: true,
                  });
                }}
              />
            )}
          />
          <input type="hidden" {...register("profilePhotoPublicId")} />
          <input type="hidden" {...register("profilePhotoUrl")} />

          <FormField
            label={m.fullName}
            required
            error={errors.fullName?.message}
          >
            <input
              className={inputClassName}
              placeholder={m.fullNamePlaceholder}
              {...register("fullName")}
            />
          </FormField>
        </div>
      </section>

      <section className={sectionClassName}>
        <h2 className="mb-1 text-xl font-semibold text-ink">
          {m.sectionEducation}
        </h2>
        <p className="mb-5 text-sm text-muted">{m.sectionEducationHint}</p>
        <p className="mb-5 text-sm text-ink">
          {m.programLabel}:{" "}
          <span className="ml-1 inline-flex items-center rounded-lg bg-brand-soft px-3 py-1 text-base font-semibold text-brand-deep dark:text-brand">
            {m.programValue}
          </span>
        </p>
        <input type="hidden" {...register("academicProgram")} />
        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            label={m.groupField}
            required
            error={errors.group?.message}
          >
            <select
              className={inputClassName}
              {...register("group")}
              defaultValue=""
            >
              <option value="" disabled>
                {m.chooseGroup}
              </option>
              {GROUP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField
            label={m.passingYear}
            required
            error={errors.passingYear?.message}
          >
            <select
              className={inputClassName}
              {...register("passingYear")}
              defaultValue=""
            >
              <option value="" disabled>
                {m.chooseYear}
              </option>
              {PASSING_YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </section>

      <section className={sectionClassName}>
        <h2 className="mb-1 text-xl font-semibold text-ink">{m.sectionWork}</h2>
        <p className="mb-5 text-sm text-muted">{m.sectionWorkHint}</p>
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label={m.occupation} error={errors.occupation?.message}>
            <input
              className={inputClassName}
              placeholder={m.occupationPlaceholder}
              {...register("occupation")}
            />
          </FormField>
          <FormField label={m.designation} error={errors.designation?.message}>
            <input
              className={inputClassName}
              placeholder={m.designationPlaceholder}
              {...register("designation")}
            />
          </FormField>
          <FormField
            label={m.organization}
            error={errors.organization?.message}
          >
            <input
              className={inputClassName}
              placeholder={m.organizationPlaceholder}
              {...register("organization")}
            />
          </FormField>
          <FormField
            label={m.officeAddress}
            error={errors.officeAddress?.message}
          >
            <input
              className={inputClassName}
              placeholder={m.officePlaceholder}
              {...register("officeAddress")}
            />
          </FormField>
        </div>
      </section>

      <section className={sectionClassName}>
        <h2 className="mb-1 text-xl font-semibold text-ink">
          {m.sectionAddress}
        </h2>
        <p className="mb-5 text-sm text-muted">{m.sectionAddressHint}</p>

        <fieldset className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="radio"
              value="bangladesh"
              {...register("address.regionType")}
              className="h-4 w-4 accent-brand"
            />
            {m.bangladesh}
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="radio"
              value="overseas"
              {...register("address.regionType")}
              className="h-4 w-4 accent-brand"
            />
            {m.overseas}
          </label>
        </fieldset>

        {regionType === "bangladesh" ? (
          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              label={m.division}
              required
              error={addressErrors?.division?.message}
            >
              <select
                className={inputClassName}
                {...register("address.division")}
                onChange={(e) => {
                  register("address.division").onChange(e);
                  setValue("address.district", "");
                }}
              >
                <option value="">{m.chooseDivision}</option>
                {BD_DIVISIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {lang === "en" ? d.en : d.label}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField
              label={m.district}
              required
              error={addressErrors?.district?.message}
            >
              <select
                className={inputClassName}
                {...register("address.district")}
                disabled={!division}
              >
                <option value="">{m.chooseDistrict}</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {districtLabel(d, lang)}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label={m.upazila}>
              <input
                className={inputClassName}
                placeholder={m.upazilaPlaceholder}
                {...register("address.upazila")}
              />
            </FormField>
            <FormField label={m.postOffice}>
              <input
                className={inputClassName}
                placeholder={m.postOfficePlaceholder}
                {...register("address.postOffice")}
              />
            </FormField>
            <div className="md:col-span-2">
              <FormField label={m.streetOptional}>
                <input
                  className={inputClassName}
                  placeholder={m.streetBdPlaceholder}
                  {...register("address.streetAddress")}
                />
              </FormField>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              label={m.country}
              required
              error={addressErrors?.country?.message}
            >
              <select
                className={inputClassName}
                {...register("address.country")}
              >
                <option value="">{m.chooseCountry}</option>
                {OVERSEAS_COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="CUSTOM">{m.customCountry}</option>
              </select>
            </FormField>
            {country === "CUSTOM" ? (
              <FormField
                label={m.countryName}
                required
                error={addressErrors?.customCountry?.message}
              >
                <input
                  className={inputClassName}
                  {...register("address.customCountry")}
                />
              </FormField>
            ) : null}
            <FormField
              label={m.state}
              required
              error={addressErrors?.stateOrRegion?.message}
            >
              <input
                className={inputClassName}
                placeholder={m.statePlaceholder}
                {...register("address.stateOrRegion")}
              />
            </FormField>
            <FormField label={m.city}>
              <input
                className={inputClassName}
                placeholder={m.cityPlaceholder}
                {...register("address.city")}
              />
            </FormField>
            <FormField label={m.postal}>
              <input
                className={inputClassName}
                placeholder={m.postalPlaceholder}
                {...register("address.postalCode")}
              />
            </FormField>
            <FormField label={m.street}>
              <input
                className={inputClassName}
                placeholder={m.streetOsPlaceholder}
                {...register("address.streetAddress")}
              />
            </FormField>
          </div>
        )}
      </section>

      <section className={sectionClassName}>
        <h2 className="mb-1 text-xl font-semibold text-ink">
          {m.sectionAccount}
        </h2>
        <p className="mb-5 text-sm text-muted">{m.sectionAccountHint}</p>
        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            label={m.phone}
            required
            error={errors.mobilePhone?.message}
          >
            <input
              className={inputClassName}
              placeholder="01XXXXXXXXX"
              readOnly={lockPhone}
              disabled={lockPhone}
              {...register("mobilePhone")}
            />
          </FormField>
          <div className="flex flex-col gap-2">
            <FormField
              label={m.whatsapp}
              required
              error={errors.whatsappPhone?.message}
            >
              <input
                className={inputClassName}
                placeholder="01XXXXXXXXX"
                readOnly={Boolean(whatsappSameAsMobile)}
                disabled={Boolean(whatsappSameAsMobile)}
                {...register("whatsappPhone")}
              />
            </FormField>
            <label className="inline-flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                className="h-4 w-4 accent-brand"
                {...register("whatsappSameAsMobile")}
              />
              {m.whatsappSame}
            </label>
          </div>
          <FormField label={m.emailOptional} error={errors.email?.message}>
            <input
              className={inputClassName}
              placeholder="you@example.com"
              type="email"
              {...register("email")}
            />
          </FormField>

          {mode === "register" ? (
            <>
              <FormField
                label={m.password}
                required
                hint={m.passwordHint}
                error={errors.password?.message}
              >
                <input
                  className={inputClassName}
                  type="password"
                  autoComplete="new-password"
                  {...register("password")}
                />
              </FormField>
              <FormField
                label={m.confirmPassword}
                required
                error={errors.confirmPassword?.message}
              >
                <input
                  className={inputClassName}
                  type="password"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                />
              </FormField>
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}
