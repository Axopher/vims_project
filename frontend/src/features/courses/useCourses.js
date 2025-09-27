// src/features/courses/hooks/useCourses.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as courseServices from "../../services/course/apiCourse";

export const useCourses = ({ page = 1, page_size = 10, search = "" } = {}) => {
  return useQuery({
    queryKey: ["courses", page, page_size, search],
    queryFn: () => courseServices.getCourses({ page, page_size, search }),
    keepPreviousData: true,
  });
};

export const useCourse = (idx) => {
  return useQuery({
    queryKey: ["course", idx],
    queryFn: () => courseServices.getCourseByIdx(idx),
    enabled: !!idx,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => courseServices.createCourse(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idx, data }) => courseServices.updateCourse({ idx, data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idx) => courseServices.deleteCourse(idx),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });
};
