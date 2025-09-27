// src/features/courses/useInstructors.js
import { useQuery } from "@tanstack/react-query";
import * as instructorService from "../../services/course/apiInstructor";

export const useInstructors = ({ page = 1, page_size = 25, q = "" } = {}) => {
  return useQuery({
    queryKey: ["instructors", page, page_size, q],
    queryFn: () => instructorService.listInstructors({ page, page_size, q }),
    keepPreviousData: true,
  });
};
