"use client";
import { useAIDescription } from "@/hooks/useGoogle";
import { useSendQuestion } from "@/hooks/useSendQuestion";
import styles from "./page.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@gotracksuit/design";
import { Checkbox } from "@gotracksuit/design";

type Question = {
  questionText: string;
  singleInput: boolean;
  options: string[];
  AIExplanation: {
    whyQuestionRocks: string;
    whatInsightUnlocks: string;
  };
};

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [industry, setIndustry] = useState("");
  const [brand, setBrand] = useState("");
  const emptyQuestion: Question = {
    questionText: "",
    singleInput: true,
    options: [""],
    AIExplanation: {
      whyQuestionRocks: "",
      whatInsightUnlocks: "",
    },
  };

  const [newQuestion, setNewQuestion] = useState<Question>(emptyQuestion);
  const [hasAIResponse, setHasAIResponse] = useState(false);
  const {
    mutate: sendQuestion,
    isPending: isSending,
    error: sendError,
    data: sendData,
  } = useSendQuestion();

  const getQuestion = useAIDescription();
  const router = useRouter();

  const handleTestSend = async () => {
    sendQuestion({
      text: "What is your favorite color?",
      accountBrandId: 0,
      options: ["red", "blue"],
      AIExplanation: {
        whyQuestionRocks: "Colors reveal preferences",
        whatInsightUnlocks: "Understanding user aesthetic choices",
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    getQuestion.mutate(
      {
        inputText: `${inputText}. The industry I am interested in is ${industry} and my brand is ${brand}`,
      },
      {
        onSuccess: (data) => {
          try {
            // Extract JSON from the markdown code block if present
            let jsonData = data;
            if (typeof data === "string" && data.includes("```json")) {
              jsonData = data.split("```json")[1].split("```")[0];
            }

            // Parse the JSON if it's a string
            const parsedData =
              typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;

            // Create the question data with the parsed response
            const questionData: Question = {
              questionText: parsedData.questionText || "",
              singleInput:
                typeof parsedData.singleInput === "boolean"
                  ? parsedData.singleInput
                  : true,
              options:
                Array.isArray(parsedData.options) &&
                parsedData.options.length > 0
                  ? parsedData.options
                  : [""],
              AIExplanation: {
                whyQuestionRocks: parsedData.AIExplanation.whyQuestionRocks,
                whatInsightUnlocks: parsedData.AIExplanation.whatInsightUnlocks,
              },
            };

            setNewQuestion(questionData);
            setHasAIResponse(true);
          } catch (error) {
            console.error("Error processing AI response:", error);
            // Handle the error appropriately - maybe show a user message
            setNewQuestion(emptyQuestion);
          }
        },
      }
    );
  };

  const handleSubmitAndReload = () => {
    router.refresh();
  };

  // Handle question text changes
  const handleQuestionTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setNewQuestion((prev) => ({
      ...prev,
      questionText: e.target.value,
    }));
  };

  // Handle single/multiple choice toggle
  const handleSingleInputChange = (checked: boolean) => {
    setNewQuestion((prev) => ({
      ...prev,
      singleInput: checked,
    }));
  };

  // Handle option changes
  const handleOptionChange = (index: number, value: string) => {
    setNewQuestion((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }));
  };

  // Add new option
  const addOption = () => {
    setNewQuestion((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  };

  // Remove option
  const removeOption = (index: number) => {
    setNewQuestion((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {/* Test Section for useSendQuestion */}
        {/* <div className={styles.questionEditor}>
          <h2>Test Send Question</h2>
          <button
            onClick={handleTestSend}
            className={styles.primary}
            disabled={isSending}
          >
            {isSending ? "Sending..." : "Send Test Question"}
          </button>
          {sendData && (
            <div className={styles.success}>
              <p>Question sent! ID: {sendData.questionId}</p>
              <p>Text: {sendData.originalText}</p>
              <div className="mt-4">
                <h3 className="font-medium">AI Explanation:</h3>
                <p>Why it rocks: {sendData.AIExplanation.whyQuestionRocks}</p>
                <p>Insights: {sendData.AIExplanation.whatInsightUnlocks}</p>
              </div>
            </div>
          )}
        </div> */}
        <h1 className={styles.omni}>🔥 Have a burning question?</h1>
        <h2 className={styles.h2}>
          Book your seat on the Track-O-Mnibus and get your insights tomorrow{" "}
          <span className={styles.emoji}>🚌</span>
        </h2>
        {/* Initial Input Form */}
        {!hasAIResponse && (
          <form className={styles.questionEditor} onSubmit={handleSubmit}>
            <h1 className={styles.title}>Tell us a bit about yourself</h1>
            <div className={styles.field}>
              <label>Industry:</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Enter industry..."
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="brand">Brand:</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Enter brand..."
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label>
                What do you want to know?
                <br />
                <i className={styles.example}>
                  For example: "What packaging cues drive purchase intent for
                  our peanut butter SKU?" or "Which CSR initiatives generate the
                  strongest emotional engagement with rock climbing brands?"
                </i>
              </label>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Describe what you want to know..."
                className={styles.input}
              />
            </div>
            <Button
              theme="primary"
              label={
                getQuestion.isPending ? "Generating..." : "Generate Question"
              }
              type="submit"
              className={styles.primary}
              disabled={getQuestion.isPending}
            />
          </form>
        )}
        {/* Question Editor (only shown after AI response) */}
        {hasAIResponse && newQuestion && (
          <>
            <div className={styles.questionEditor}>
              <div className={styles.header}>
                <h1 className={styles.title}>Here's what we'll ask people</h1>
              </div>
              <div className={styles.field}>
                <label>Question:</label>
                <textarea
                  value={newQuestion.questionText}
                  onChange={handleQuestionTextChange}
                  className={styles.textarea}
                  rows={2}
                />
              </div>
              <div className={styles.field}>
                <label>Options:</label>
                {Array.isArray(newQuestion.options) &&
                  newQuestion.options.map((option, index) => (
                    <div key={index} className={styles.optionRow}>
                      <input
                        type="text"
                        value={option || ""}
                        onChange={(e) =>
                          handleOptionChange(index, e.target.value)
                        }
                        className={styles.input}
                        placeholder={`Option ${index + 1}`}
                      />
                      {newQuestion.options.length > 1 && (
                        <Button
                          theme="secondary"
                          type="button"
                          onClick={() => removeOption(index)}
                          label="Remove"
                        />
                      )}
                    </div>
                  ))}
                <Button
                  className={styles["custom-button"]}
                  theme="secondary"
                  label="Add option"
                  type="button"
                  onClick={addOption}
                />
                <br />
                <p>
                  <strong className={styles.strong}>
                    This question rocks{" "}
                  </strong>
                  {newQuestion.AIExplanation.whyQuestionRocks.replace(
                    "This question rocks ",
                    ""
                  )}
                </p>
                <br />
                <p>
                  <strong className={styles.strong}>
                    You'll love the insight{" "}
                  </strong>
                  {newQuestion.AIExplanation.whatInsightUnlocks.replace(
                    "You'll love the insight ",
                    ""
                  )}
                </p>

                {/* <Link href={"/"}>
                  <button
                    type="button"
                    onClick={handleSubmitAndReload}
                    className={styles.secondary}
                  >
                    Submit
                  </button>
                </Link> */}
              </div>
              <Button
                theme="primary"
                label={isSending ? "Sending..." : "Submit"}
                onClick={() => {
                  // Send the question data
                  sendQuestion({
                    text: newQuestion.questionText,
                    accountBrandId: 0, // Using default accountBrandId as in test
                    options: newQuestion.options,
                    AIExplanation: newQuestion.AIExplanation,
                  });

                  // Reset all form fields
                  setHasAIResponse(false);
                  setNewQuestion(emptyQuestion);
                  setInputText("");
                  setIndustry("");
                  setBrand("");
                }}
                disabled={isSending}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
