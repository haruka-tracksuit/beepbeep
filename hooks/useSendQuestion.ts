import { useMutation } from "@tanstack/react-query";

interface AIExplanation {
  whyQuestionRocks: string;
  whatInsightUnlocks: string;
}

interface SendQuestionResponse {
  questionId: string;
  originalText: string;
  options: string[];
  AIExplanation: AIExplanation;
}

interface SendQuestionVariables {
  text: string;
  accountBrandId: number;
  options: string[];
  AIExplanation?: AIExplanation;
}

export function useSendQuestion() {
  return useMutation({
    mutationFn: async ({
      text,
      accountBrandId,
      options,
      AIExplanation,
    }: SendQuestionVariables) => {
      const response = await fetch("/api/send-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputText: text,
          accountBrandId,
          options,
          AIExplanation,
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          "Server returned non-JSON response. Please check server logs."
        );
      }

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.error || `Server error: ${response.status}`
        );
      }

      return responseData as SendQuestionResponse;
    },
  });
}
