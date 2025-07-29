// /app/api/logs/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import CallLog from "@/models/CallLog";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status");
    const response = searchParams.get("response");
    const search = searchParams.get("search");

    // Connect to database
    await connectDB();

    // Build filter query
    const filter: Record<string, unknown> = {};

    if (status && status !== "all") {
      filter.call_status = status;
    }

    if (response && response !== "all") {
      filter.user_response = response;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await CallLog.countDocuments(filter);

    // Fetch logs with pagination and sorting
    const logs = await CallLog.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Get summary statistics
    const stats = await CallLog.aggregate([
      {
        $group: {
          _id: null,
          totalCalls: { $sum: 1 },
          completedCalls: {
            $sum: { $cond: [{ $eq: ["$call_status", "completed"] }, 1, 0] },
          },
          failedCalls: {
            $sum: { $cond: [{ $eq: ["$call_status", "failed"] }, 1, 0] },
          },
          noAnswerCalls: {
            $sum: { $cond: [{ $eq: ["$call_status", "no_answer"] }, 1, 0] },
          },
          pendingCalls: {
            $sum: { $cond: [{ $eq: ["$call_status", "pending"] }, 1, 0] },
          },
          payNowResponses: {
            $sum: { $cond: [{ $eq: ["$user_response", "now"] }, 1, 0] },
          },
          payLaterResponses: {
            $sum: { $cond: [{ $eq: ["$user_response", "later"] }, 1, 0] },
          },
          refusedResponses: {
            $sum: { $cond: [{ $eq: ["$user_response", "refused"] }, 1, 0] },
          },
          totalAmountOwed: { $sum: "$amount" },
        },
      },
    ]);

    const summary = stats[0] || {
      totalCalls: 0,
      completedCalls: 0,
      failedCalls: 0,
      noAnswerCalls: 0,
      pendingCalls: 0,
      payNowResponses: 0,
      payLaterResponses: 0,
      refusedResponses: 0,
      totalAmountOwed: 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        logs: logs.map((log) => ({
          ...log,
          _id: log._id?.toString(),
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage,
          hasPrevPage,
        },
        summary,
        filters: {
          status,
          response,
          search,
        },
      },
    });
  } catch (error) {
    console.error("Logs fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}
