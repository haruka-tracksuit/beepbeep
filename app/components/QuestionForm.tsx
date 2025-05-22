import { useState } from "react";
import { useSendQuestion } from "../../hooks/useSendQuestion";

interface QuestionFormProps {
  accountBrandId: number;
}

export function QuestionForm({ accountBrandId }: QuestionFormProps) {
  const [questionText, setQuestionText] = useState("");
  const {
    mutate: sendQuestion,
    isPending: isLoading,
    error,
    data,
  } = useSendQuestion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    sendQuestion({
      text: questionText,
      accountBrandId,
      options: ["red", "blue"],
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="question"
            className="block text-sm font-medium text-gray-700"
          >
            Enter your question
          </label>
          <textarea
            id="question"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            rows={4}
            placeholder="Type your question here..."
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !questionText.trim()}
          className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm
            ${
              isLoading || !questionText.trim()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            }`}
        >
          {isLoading ? "Sending..." : "Send Question"}
        </button>

        {error instanceof Error && (
          <div className="mt-2 text-red-600 text-sm">{error.message}</div>
        )}

        {data && (
          <div className="mt-4 p-4 bg-green-50 rounded-md">
            <h3 className="text-sm font-medium text-green-800">
              Question sent successfully!
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>Question ID: {data.questionId}</p>
              <p>Text: {data.originalText}</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
