// /models/CallLog.ts
import mongoose, { Document, Schema } from "mongoose";

export interface ICallLog extends Document {
  name: string;
  phone: string;
  amount: number;
  call_status: "pending" | "completed" | "failed" | "no_answer";
  call_summary?: string;
  user_response?: "now" | "later" | "refused" | "no_response";
  vapi_call_id?: string;
  timestamp: Date;
  created_at: Date;
  updated_at: Date;
}

const CallLogSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    call_status: {
      type: String,
      enum: ["pending", "completed", "failed", "no_answer"],
      required: true,
      default: "pending",
    },
    call_summary: {
      type: String,
      trim: true,
    },
    user_response: {
      type: String,
      enum: ["now", "later", "refused", "no_response"],
    },
    vapi_call_id: {
      type: String,
      trim: true,
      index: true,
      sparse: true, // Only index non-null values
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    collection: "call_logs",
  }
);

// Additional indexes
CallLogSchema.index({ timestamp: -1 });
CallLogSchema.index({ phone: 1, timestamp: -1 });

// Create the model
const CallLog =
  mongoose.models.CallLog || mongoose.model<ICallLog>("CallLog", CallLogSchema);

export default CallLog;
