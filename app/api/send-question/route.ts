import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // receive data
    const { inputText, options } = await request.json();

    // Validate input
    if (!inputText || typeof inputText !== "string") {
      return NextResponse.json(
        { error: "Invalid input text" },
        { status: 400 }
      );
    }

    const accountBrandId = 10001;

    if (!Array.isArray(options)) {
      return NextResponse.json(
        { error: "Options must be an array" },
        { status: 400 }
      );
    }

    // Check required environment variables
    const hasuraApiKey = process.env.HASURA_API_KEY;
    const hasuraBaseUrl = process.env.HASURA_BASE_URL;

    if (!hasuraApiKey || !hasuraBaseUrl) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // First, insert the question
    const questionMutation = `
      mutation InsertQuestion($text: String!, $account_brand_id: bigint!) {
        insert_omnibus_question_one(object: {
          text: $text,
          account_brand_id: $account_brand_id
        }) {
          id
        }
      }
    `;

    const questionResponse = await fetch(hasuraBaseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": hasuraApiKey,
      },
      body: JSON.stringify({
        query: questionMutation,
        variables: {
          text: inputText,
          account_brand_id: accountBrandId,
        },
      }),
    });

    const questionData = await questionResponse.json();

    if (questionData.errors) {
      console.error("Hasura error:", questionData.errors);
      return NextResponse.json(
        { error: "Failed to store question" },
        { status: 500 }
      );
    }

    const questionId = questionData.data.insert_omnibus_question_one.id;

    // Then, insert all options
    const optionsMutation = `
      mutation InsertOptions($objects: [omnibus_question_option_insert_input!]!) {
        insert_omnibus_question_option(objects: $objects) {
          affected_rows
          returning {
            id
            text
          }
        }
      }
    `;

    const optionObjects = options.map((optionText) => ({
      text: optionText,
      question_id: questionId,
    }));

    const optionsResponse = await fetch(hasuraBaseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": hasuraApiKey,
      },
      body: JSON.stringify({
        query: optionsMutation,
        variables: { objects: optionObjects },
      }),
    });

    const optionsData = await optionsResponse.json();

    if (optionsData.errors) {
      console.error("Options error:", optionsData.errors);
      return NextResponse.json(
        { error: "Failed to store options" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      questionId,
      originalText: inputText,
      options: optionsData.data.insert_omnibus_question_option.returning,
      AIExplanation: {
        whyQuestionRocks: "This question helps understand user preferences",
        whatInsightUnlocks:
          "Color preferences can indicate personality traits and design preferences",
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
