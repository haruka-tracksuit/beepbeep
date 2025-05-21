"use client";
import { useAIDescription } from "@/hooks/useGoogle";
import styles from "./page.module.css";
import { useState } from "react";

type Question = {
  questionText: string;
  singleInput: boolean;
  options: string[];
};

export default function Home() {
  const [inputText, setInputText] = useState("");
  const emptyQuestion: Question = {
    questionText: "",
    singleInput: true,
    options: [""],
  };

  const [newQuestion, setNewQuestion] = useState<Question>(emptyQuestion);
  const [hasAIResponse, setHasAIResponse] = useState(false);

  const getQuestion = useAIDescription();
  console.log(newQuestion);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    getQuestion.mutate(
      { inputText },
      {
        onSuccess: (data) => {
          // Log the received data
          console.log("Received AI response:", data);

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
            };

            // Log the processed data
            console.log("Processed question data:", questionData);

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
  const handleSingleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewQuestion((prev) => ({
      ...prev,
      singleInput: e.target.checked,
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
        {/* Initial Input Form */}
        {!hasAIResponse && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <h2>Enter your question prompt</h2>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Describe the question you want to create..."
              className={styles.input}
            />
            <button
              type="submit"
              className={styles.primary}
              disabled={getQuestion.isPending}
            >
              {getQuestion.isPending ? "Generating..." : "Generate Question"}
            </button>
          </form>
        )}

        {/* Question Editor (only shown after AI response) */}
        {hasAIResponse && newQuestion && (
          <div className={styles.questionEditor}>
            <div className={styles.header}>
              <h2>Edit Generated Question</h2>
              <button
                onClick={() => {
                  setHasAIResponse(false);
                  setNewQuestion(emptyQuestion);
                  setInputText("");
                }}
                className={styles.secondary}
              >
                Create New Question
              </button>
            </div>

            <div className={styles.field}>
              <label>Question Text:</label>
              <textarea
                value={newQuestion.questionText}
                onChange={handleQuestionTextChange}
                className={styles.textarea}
                rows={3}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={newQuestion.singleInput}
                  onChange={handleSingleInputChange}
                />
                Single Choice Question
              </label>
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
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className={styles.removeButton}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              <button
                type="button"
                onClick={addOption}
                className={styles.secondary}
              >
                Add Option
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
