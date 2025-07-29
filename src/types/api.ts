// /types/api.ts
export interface DebtorRow {
  name: string;
  phone: string;
  amount_owed: string | number;
  upi_id: string;
}

export interface UploadResponse {
  success: boolean;
  data?: {
    url: string;
    publicId: string;
    filename: string;
    size: number;
    uploadedAt: string;
  };
  error?: string;
}

export interface CampaignResponse {
  success: boolean;
  data?: {
    totalProcessed: number;
    successfulCalls: number;
    failedCalls: number;
    results: Array<{
      row: number;
      name: string;
      phone: string;
      amount: number;
      vapiCallId: string;
      status: string;
      logId: string;
    }>;
    errors: Array<{
      row: number;
      error: string;
      debtor: DebtorRow;
    }>;
    csvUrl?: string;
  };
  error?: string;
}

export interface LogsResponse {
  success: boolean;
  data?: {
    logs: Array<{
      _id: string;
      name: string;
      phone: string;
      amount: number;
      upi_id: string;
      call_status: "pending" | "completed" | "failed" | "no_answer";
      call_summary?: string;
      user_response?: "now" | "later" | "refused" | "no_response";
      vapi_call_id?: string;
      timestamp: string;
      created_at: string;
      updated_at: string;
      sms_sent?: boolean;
      sms_sent_at?: string;
    }>;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    summary: {
      totalCalls: number;
      completedCalls: number;
      failedCalls: number;
      noAnswerCalls: number;
      pendingCalls: number;
      payNowResponses: number;
      payLaterResponses: number;
      refusedResponses: number;
      totalAmountOwed: number;
    };
    filters: {
      status?: string;
      response?: string;
      search?: string;
    };
  };
  error?: string;
}

export interface SendUPIResponse {
  success: boolean;
  data?: {
    phoneNumber: string;
    amount: number;
    upiId: string;
    message: string;
    sentAt: string;
  };
  error?: string;
}

export interface WebhookEvent {
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
      customerUpiId: string;
      orgUpiId: string;
    };
  };
  timestamp: string;
}
