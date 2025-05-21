import { getAIQuestion } from "../api/google";
import { useMutation } from "@tanstack/react-query";

export function useAIDescription() {
  return useMutation({
    mutationFn: getAIQuestion,
  });
}
