import mongoose, { Schema, type InferSchemaType } from "mongoose";

const bangladeshAddressSchema = new Schema(
  {
    regionType: { type: String, enum: ["bangladesh"], required: true },
    division: { type: String, required: true },
    district: { type: String, required: true },
    upazila: { type: String, default: "" },
    postOffice: { type: String, default: "" },
    streetAddress: { type: String, default: "" },
  },
  { _id: false },
);

const overseasAddressSchema = new Schema(
  {
    regionType: { type: String, enum: ["overseas"], required: true },
    country: { type: String, required: true },
    customCountry: { type: String, default: "" },
    stateOrRegion: { type: String, required: true },
    city: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    streetAddress: { type: String, default: "" },
  },
  { _id: false },
);

const alumniProfileSchema = new Schema(
  {
    role: { type: String, enum: ["user", "admin"], default: "user" },
    passwordHash: { type: String, required: true, select: false },
    fullName: { type: String, required: true },
    academicProgram: { type: String, required: true, default: "মাধ্যমিক (SSC)" },
    group: { type: String, required: true },
    passingYear: { type: String, required: true },
    occupation: { type: String, default: "" },
    designation: { type: String, default: "" },
    organization: { type: String, default: "" },
    officeAddress: { type: String, default: "" },
    profilePhotoUrl: { type: String, required: true },
    profilePhotoPublicId: { type: String, required: true },
    mobilePhone: { type: String, required: true, unique: true, index: true },
    whatsappPhone: { type: String, required: true, default: "" },
    email: { type: String, default: "" },
    feePaid: { type: Boolean, required: true, default: false, index: true },
    address: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

export type AlumniProfileDocument = InferSchemaType<typeof alumniProfileSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

if (mongoose.models.AlumniProfile) {
  mongoose.deleteModel("AlumniProfile");
}

export const AlumniProfileModel = mongoose.model<AlumniProfileDocument>(
  "AlumniProfile",
  alumniProfileSchema,
);