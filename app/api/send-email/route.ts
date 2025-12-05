import { NextRequest, NextResponse } from "next/server";
import { sendResultsEmail } from "@/lib/email";
import { submissionSchema, calculatedScoresSchema } from "@/types/assessment-schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate submission data
    const validatedData = submissionSchema.parse(body);
    
    // Validate scores (they come from the client)
    const scores = calculatedScoresSchema.parse(body.scores);
    
    // Send email with extended submission including scores
    const result = await sendResultsEmail({
      ...validatedData,
      scores,
    });
    
    if (result.success) {
      return NextResponse.json(
        { success: true, message: "Email sent successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: "Failed to send email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { success: false, message: "Error processing request" },
      { status: 500 }
    );
  }
}

