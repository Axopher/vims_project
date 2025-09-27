// src/features/courses/hooks/useCourseClasses.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as courseClassServices from "../../services/course/apiCourseClass";

export const useCourseClasses = ({
  page = 1,
  page_size = 10,
  search = "",
  course_idx = "",
  term_idx = "",
} = {}) => {
  return useQuery({
    queryKey: ["course-classes", page, page_size, search, course_idx, term_idx],
    queryFn: () =>
      courseClassServices.listCourseClasses({
        page,
        page_size,
        search,
        course_idx,
        term_idx,
      }),
    keepPreviousData: true,
  });
};

export const useCourseClass = (idx) => {
  return useQuery({
    queryKey: ["course-class", idx],
    queryFn: () => courseClassServices.getCourseClassByIdx(idx),
    enabled: !!idx,
  });
};

export const useCreateCourseClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => courseClassServices.createCourseClass(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["course-classes"] }),
  });
};

export const useUpdateCourseClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idx, data }) =>
      courseClassServices.updateCourseClass({ idx, data }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["course-classes"] }),
  });
};

export const useDeleteCourseClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idx) => courseClassServices.deleteCourseClass(idx),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["course-classes"] }),
  });
};

export const useAssignInstructor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ classIdx, instructor_idx, assigned_on }) =>
      courseClassServices.assignInstructor({
        classIdx,
        instructor_idx,
        assigned_on,
      }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["course-classes"] });
      queryClient.invalidateQueries({
        queryKey: ["course-class", vars.classIdx],
      });
    },
  });
};

export const useUnassignInstructor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ classIdx, instructorIdx: instructor_idx }) =>
      courseClassServices.unassignInstructor({ classIdx, instructor_idx }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["course-classes"] });
      queryClient.invalidateQueries({
        queryKey: ["course-class", vars.classIdx],
      });
    },
  });
};

export const useEnrolledStudents = (classIdx) => {
  return useQuery({
    queryKey: ["course-class-enrollments", classIdx],
    queryFn: () => courseClassServices.getEnrolledStudents(classIdx),
    enabled: !!classIdx,
  });
};
