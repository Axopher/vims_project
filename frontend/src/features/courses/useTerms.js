// src/features/courses/useTerms.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as termService from "../../services/course/apiTerm";

export const useTerms = ({ page = 1, page_size = 10, search = "" } = {}) =>
  useQuery({
    queryKey: ["terms", page, page_size, search],
    queryFn: () => termService.getTerms({ page, page_size, search }),
    keepPreviousData: true,
  });

export const useCreateTerm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => termService.createTerm(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["terms"] }),
  });
};

export const useUpdateTerm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idx, data }) => termService.updateTerm({ idx, data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["terms"] }),
  });
};

export const useDeleteTerm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idx) => termService.deleteTerm(idx),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["terms"] }),
  });
};
