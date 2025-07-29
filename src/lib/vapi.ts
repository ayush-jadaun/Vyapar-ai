// /lib/vapi.ts
const VAPI_API_KEY = process.env.VAPI_API_KEY!;
const VAPI_BASE_URL = "https://api.vapi.ai";
const ORG_UPI_ID = process.env.ORG_UPI_ID || "yourorg@upi";

if (!VAPI_API_KEY) {
  throw new Error("Please define the VAPI_API_KEY environment variable");
}

export interface VapiCallRequest {
  phoneNumberId: string;
  customer: {
    number: string;
    name?: string;
  };
  assistant: {
    model: {
      provider: string;
      model: string;
      messages: Array<{
        role: string;
        content: string;
      }>;
    };
    voice: {
      provider: string;
      voiceId: string;
    };
    firstMessage: string;
  };
  metadata?: Record<string, unknown>;
}

export interface VapiCallResponse {
  id: string;
  status: string;
  phoneNumberId: string;
  customer: {
    number: string;
    name?: string;
  };
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export async function createVapiCall(
  phoneNumber: string,
  name: string,
  amountOwed: number,
): Promise<VapiCallResponse> {
  const callRequest: VapiCallRequest = {
    phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID!,
    customer: {
      number: phoneNumber,
      name: name,
    },
    assistant: {
      model: {
        provider: "openai",
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a polite debt collection assistant. Your task is to:
1. Greet the person by name: "${name}"
2. Inform them they owe ₹${amountOwed}
3. Ask if they want to pay now or later
4. If they say "now", provide the organization's UPI ID: ${ORG_UPI_ID}
5. Be polite and professional throughout
6. Keep the call under 2 minutes
7. End with "Thank you for your time"

Remember: ONLY provide the organization's UPI ID (${ORG_UPI_ID}), never mention the customer's UPI ID.`,
          },
        ],
      },
      voice: {
        provider: "eleven-labs",
        voiceId: "rachel",
      },
      firstMessage: `Hello ${name}, this is regarding your pending payment of ₹${amountOwed}. Would you like to pay now or later?`,
    },
    metadata: {
      customerName: name,
      amountOwed: amountOwed,
      orgUpiId: ORG_UPI_ID,
    },
  };

  try {
    const response = await fetch(`${VAPI_BASE_URL}/call`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(callRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Vapi API error: ${response.status} - ${errorText}`);
    }

    const result: VapiCallResponse = await response.json();
    return result;
  } catch (error) {
    console.error("Vapi call creation error:", error);
    throw new Error("Failed to create Vapi call");
  }
}

export async function getVapiCall(callId: string): Promise<unknown> {
  try {
    const response = await fetch(`${VAPI_BASE_URL}/call/${callId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Vapi API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Vapi get call error:", error);
    throw new Error("Failed to get Vapi call details");
  }
}

export interface SMSRequest {
  to: string;
  message: string;
}

// Simple SMS function - you can integrate with Twilio, AWS SNS, or any SMS provider
export async function sendSMS(
  phoneNumber: string,
  message: string
): Promise<void> {
  // This is a placeholder - implement with your preferred SMS provider
  console.log(`SMS to ${phoneNumber}: ${message}`);

  // Example with a generic SMS API
  // const smsResponse = await fetch('YOUR_SMS_PROVIDER_URL', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.SMS_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     to: phoneNumber,
  //     message: message,
  //   }),
  // });
}
