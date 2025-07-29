// /app/api/send-upi/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import { sendSMS } from "../../../lib/vapi";
import CallLog, { ICallLog } from "@/models/CallLog";
import { Types } from "mongoose";

const ORG_UPI_ID = process.env.ORG_UPI_ID || "yourorg@upi";
const ORG_NAME = process.env.ORG_NAME || "Your Organization";

interface SendUPIRequest {
  phoneNumber: string;
  amount: number;
  customerName?: string;
  logId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SendUPIRequest = await request.json();
    const { phoneNumber, amount, customerName, logId } = body;

    // Validate required fields
    if (!phoneNumber || !amount) {
      return NextResponse.json(
        { error: "Phone number and amount are required" },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    // Validate phone number format
    let formattedPhone = phoneNumber.toString().trim();
    if (!formattedPhone.startsWith("+")) {
      // Assume Indian number if no country code
      formattedPhone = "+91" + formattedPhone.replace(/^\+?91/, "");
    }

    // Create SMS message
    const smsMessage = `Hi ${
      customerName || "there"
    }! Please pay ₹${amount} to ${ORG_NAME}. UPI ID: ${ORG_UPI_ID}. Thank you!`;

    try {
      // Send SMS
      await sendSMS(formattedPhone, smsMessage);

      // If logId provided, update the database log
      if (logId) {
        await connectDB();

        // Validate ObjectId format
        if (!Types.ObjectId.isValid(logId)) {
          console.warn(`Invalid ObjectId format: ${logId}`);
        } else {
          await CallLog.updateOne(
            { _id: new Types.ObjectId(logId) },
            {
              $set: {
                updated_at: new Date(),
                // Add a field to track SMS sent
                sms_sent: true,
                sms_sent_at: new Date(),
              },
            }
          );
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          phoneNumber: formattedPhone,
          amount,
          upiId: ORG_UPI_ID,
          message: "SMS sent successfully",
          sentAt: new Date().toISOString(),
        },
      });
    } catch (smsError) {
      console.error("SMS sending error:", smsError);
      return NextResponse.json(
        { error: "Failed to send SMS" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Send UPI error:", error);
    return NextResponse.json(
      { error: "Failed to process UPI SMS request" },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve organization UPI details
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        upiId: ORG_UPI_ID,
        organizationName: ORG_NAME,
        supportedPaymentMethods: ["UPI", "PhonePe", "GooglePay", "Paytm"],
      },
    });
  } catch (error) {
    console.error("Get UPI details error:", error);
    return NextResponse.json(
      { error: "Failed to get UPI details" },
      { status: 500 }
    );
  }
}
