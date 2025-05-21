export async function getAIQuestion({ inputText }: { inputText: string }) {
  try {
    const info = JSON.stringify({ inputText });

    const res = await fetch("/api/get-question", {
      method: "POST",
      body: info,
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(
        `Failed to fetch response from google AI (${res.status}): ${res.statusText}`
      );
    }

    const response = await res.json();

    return response;
  } catch (error) {
    console.error("Failed to ai response to build question ", error);
    throw new Error(
      "Failed to ai response to build question. Please try again."
    );
  }
}
