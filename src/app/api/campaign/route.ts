// /app/api/campaign/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import { createVapiCall } from "../../../lib/vapi";
import CallLog from "@/models/CallLog";

interface DebtorRow {
  name: string;
  phone: string;
  amount_owed: string | number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { debtors, csvUrl } = body;

    if (!debtors || !Array.isArray(debtors)) {
      return NextResponse.json(
        { error: "Debtors array is required" },
        { status: 400 }
      );
    }

    // Connect to database using Mongoose
    await connectDB();

    const results = [];
    const errors = [];

    // Process each debtor
    for (let i = 0; i < debtors.length; i++) {
      const debtor: DebtorRow = debtors[i];

      try {
        // Validate required fields
        if (!debtor.name || !debtor.phone || !debtor.amount_owed) {
          errors.push({
            row: i + 1,
            error: "Missing required fields",
            debtor,
          });
          continue;
        }

        // Parse amount
        const amount =
          typeof debtor.amount_owed === "string"
            ? parseFloat(debtor.amount_owed)
            : debtor.amount_owed;

        if (isNaN(amount) || amount <= 0) {
          errors.push({
            row: i + 1,
            error: "Invalid amount",
            debtor,
          });
          continue;
        }

        // Validate phone number format
        let phoneNumber = debtor.phone.toString().trim();
        if (!phoneNumber.startsWith("+")) {
          // Assume Indian number if no country code
          phoneNumber = "+91" + phoneNumber.replace(/^\+?91/, "");
        }

        // Create initial log entry using Mongoose model
        const logEntry = new CallLog({
          name: debtor.name.trim(),
          phone: phoneNumber,
          amount: amount,
          call_status: "pending",
          timestamp: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        });

        // Save to database first
        const savedLog = await logEntry.save();

        // Create Vapi call
        const vapiCall = await createVapiCall(
          phoneNumber,
          debtor.name.trim(),
          amount
        );

        // Update log with Vapi call ID
        savedLog.vapi_call_id = vapiCall.id;
        savedLog.updated_at = new Date();
        await savedLog.save();

        results.push({
          row: i + 1,
          name: debtor.name,
          phone: phoneNumber,
          amount: amount,
          vapiCallId: vapiCall.id,
          status: "initiated",
          logId: savedLog._id.toString(),
        });

        // Add small delay between calls to avoid rate limiting
        if (i < debtors.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Error processing debtor ${i + 1}:`, error);
        errors.push({
          row: i + 1,
          error: error instanceof Error ? error.message : "Unknown error",
          debtor,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalProcessed: debtors.length,
        successfulCalls: results.length,
        failedCalls: errors.length,
        results,
        errors,
        csvUrl,
      },
    });
  } catch (error) {
    console.error("Campaign creation error:", error);
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}
