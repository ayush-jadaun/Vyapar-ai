// /app/api/vapi/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import { sendSMS } from "../../../../lib/vapi";
import CallLog, { ICallLog } from "@/models/CallLog";

interface VapiWebhookEvent {
  type: string;
  call: {
    id: string;
    status: string;
    phoneNumberId: string;
    customer: {
      number: string;
      name?: string;
    };
    summary?: string;
    transcript?: string;
    duration?: number;
    endedReason?: string;
    metadata?: {
      customerName: string;
      amountOwed: number;
      orgUpiId: string;
    };
  };
  timestamp: string;
}

// Extract user response from transcript using simple keyword matching
function extractUserResponse(
  transcript?: string
): "now" | "later" | "refused" | "no_response" {
  if (!transcript) return "no_response";

  const lowerTranscript = transcript.toLowerCase();

  // Check for "now" responses
  if (
    lowerTranscript.includes("now") ||
    lowerTranscript.includes("yes") ||
    lowerTranscript.includes("pay now") ||
    lowerTranscript.includes("immediately") ||
    lowerTranscript.includes("right now")
  ) {
    return "now";
  }

  // Check for "later" responses
  if (
    lowerTranscript.includes("later") ||
    lowerTranscript.includes("tomorrow") ||
    lowerTranscript.includes("next week") ||
    lowerTranscript.includes("few days") ||
    lowerTranscript.includes("wait")
  ) {
    return "later";
  }

  // Check for refusal
  if (
    lowerTranscript.includes("no") ||
    lowerTranscript.includes("refuse") ||
    lowerTranscript.includes("cannot") ||
    lowerTranscript.includes("can't") ||
    lowerTranscript.includes("unable")
  ) {
    return "refused";
  }

  return "no_response";
}

function mapVapiStatusToCallStatus(
  vapiStatus: string
): ICallLog["call_status"] {
  switch (vapiStatus.toLowerCase()) {
    case "completed":
      return "completed";
    case "failed":
    case "error":
      return "failed";
    case "busy":
    case "no-answer":
      return "no_answer";
    default:
      return "pending";
  }
}

export async function POST(request: NextRequest) {
  try {
    const event: VapiWebhookEvent = await request.json();

    console.log("Received Vapi webhook:", JSON.stringify(event, null, 2));

    // Only process call end events
    if (event.type !== "call-end") {
      return NextResponse.json({ received: true });
    }

    // Connect to database using the correct function
    await connectDB();

    // Find the log entry by Vapi call ID
    const logEntry = await CallLog.findOne({ vapi_call_id: event.call.id });

    if (!logEntry) {
      console.error("No log entry found for Vapi call ID:", event.call.id);
      return NextResponse.json(
        { error: "Call log not found" },
        { status: 404 }
      );
    }

    // Extract user response from transcript
    const userResponse = extractUserResponse(event.call.transcript);
    const callStatus = mapVapiStatusToCallStatus(event.call.status);

    // Update the log entry
    const updateData: Partial<ICallLog> = {
      call_status: callStatus,
      call_summary: event.call.summary || "No summary available",
      user_response: userResponse,
      updated_at: new Date(),
    };

    await CallLog.updateOne(
      { vapi_call_id: event.call.id },
      { $set: updateData }
    );

    // If user said "now", send SMS with organization's UPI ID
    if (userResponse === "now" && event.call.metadata?.orgUpiId) {
      try {
        const smsMessage = `Thank you for agreeing to pay ₹${event.call.metadata.amountOwed}. Please pay to UPI ID: ${event.call.metadata.orgUpiId}`;

        await sendSMS(event.call.customer.number, smsMessage);

        console.log(`SMS sent to ${event.call.customer.number} with UPI ID`);
      } catch (smsError) {
        console.error("Failed to send SMS:", smsError);
        // Don't fail the webhook because of SMS error
      }
    }

    console.log(
      `Updated call log for ${logEntry.name}: ${callStatus}, Response: ${userResponse}`
    );

    return NextResponse.json({
      success: true,
      updated: true,
      userResponse,
      callStatus,
    });
  } catch (error) {
    console.error("Vapi webhook error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

// // Verify webhook signature if needed
// export async function verifyWebhookSignature(
//   payload: string,
//   signature: string,
//   secret: string
// ): Promise<boolean> {
//   // Implement signature verification if Vapi provides it
//   // This is a placeholder implementation
//   return true;
// }
