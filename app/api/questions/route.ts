import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { QuestionsData } from "@/types/questions";

const QUESTIONS_FILE_PATH = path.join(process.cwd(), "data", "questions.json");

/**
 * GET /api/questions
 * Read questions from the JSON file
 */
export async function GET() {
  try {
    const fileContents = await fs.readFile(QUESTIONS_FILE_PATH, "utf8");
    const questions: QuestionsData = JSON.parse(fileContents);
    return NextResponse.json(questions);
  } catch (error) {
    // If file doesn't exist, return a default structure
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json(
        { error: "Questions file not found" },
        { status: 404 }
      );
    }
    console.error("Error reading questions file:", error);
    return NextResponse.json(
      { error: "Failed to read questions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/questions
 * Update questions in the JSON file
 */
export async function POST(request: NextRequest) {
  try {
    const body: QuestionsData = await request.json();

    // Basic validation - ensure structure matches expected format
    if (
      !body.worship ||
      !body.discipleship ||
      !body.mission ||
      !Array.isArray(body.worship.points) ||
      !Array.isArray(body.discipleship.points) ||
      !Array.isArray(body.mission.points)
    ) {
      return NextResponse.json(
        { error: "Invalid questions structure" },
        { status: 400 }
      );
    }

    // Write to a temporary file first, then rename (atomic operation)
    const tempFilePath = QUESTIONS_FILE_PATH + ".tmp";
    await fs.writeFile(tempFilePath, JSON.stringify(body, null, 2), "utf8");
    await fs.rename(tempFilePath, QUESTIONS_FILE_PATH);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error writing questions file:", error);
    return NextResponse.json(
      { error: "Failed to save questions" },
      { status: 500 }
    );
  }
}

