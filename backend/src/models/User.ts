import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserRole, PermissionScope } from '@shared/types';

export interface IUser extends Document {
  role: UserRole;
  fullName: string;
  phoneNumber?: string;
  email?: string;
  passwordHash: string;
  preferredLanguage: 'hi' | 'en' | string;
  assignedLocationId?: mongoose.Types.ObjectId;
  permissions: PermissionScope[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    role: {
      type: String,
      required: true,
      enum: ['FARMER', 'OFFICER', 'GOVERNMENT', 'ANALYST', 'ADMIN'],
      default: 'FARMER',
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    phoneNumber: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
      maxlength: 20,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      unique: true,
      maxlength: 255,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    preferredLanguage: {
      type: String,
      enum: ['hi', 'en'],
      default: 'hi',
    },
    assignedLocationId: {
      type: Schema.Types.ObjectId,
      ref: 'Geography',
      default: null,
    },
    permissions: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// At least one identifier (email or phone) must be provided
UserSchema.pre('validate', function () {
  if (!this.email && !this.phoneNumber) {
    this.invalidate('email', 'Either email or phoneNumber must be provided');
  }
});

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
