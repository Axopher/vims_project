// src/features/students/useStudents.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listCourseClasses } from "../../services/course/apiCourseClass";
import * as studentServices from "../../services/student/apiStudents";
import * as enrollmentServices from "../../services/student/apiEnrollments";
import toast from "react-hot-toast";

// list with paging/search
export const useStudents = ({ page = 1, page_size = 5, search = "" } = {}) =>
  useQuery({
    queryKey: ["students", page, page_size, search],
    queryFn: () => studentServices.listStudents({ page, page_size, search }),
    keepPreviousData: true,
  });

export const useStudent = (idx) =>
  useQuery({
    queryKey: ["student", idx],
    queryFn: () => studentServices.getStudentByIdx(idx),
    enabled: !!idx,
  });

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => studentServices.createStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (err) => {},
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idx, data }) => studentServices.updateStudent({ idx, data }),
    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["student", vars.idx] });
    },
    onError: (err) => {},
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idx) => studentServices.deleteStudent(idx),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
};

/* Custodians hooks */
export const useCustodians = ({ page = 1, page_size = 25, search = "" } = {}) =>
  useQuery({
    queryKey: ["custodians", page, page_size, search],
    queryFn: () => studentServices.listCustodians({ page, page_size, search }),
    keepPreviousData: true,
  });

export const useStudentCustodians = (studentIdx) =>
  useQuery({
    queryKey: ["student-custodians", studentIdx],
    queryFn: () => studentServices.listStudentCustodians(studentIdx),
    enabled: !!studentIdx,
  });

export const useCreateCustodian = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }) => studentServices.createCustodian({ data }),
    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({ queryKey: ["custodians"] });

      if (vars.data.student_idx) {
        queryClient.invalidateQueries({
          queryKey: ["student-custodians", vars.data.student_idx],
        });
      }
    },
    onError: (err) => toast.error(err.message || "Failed to delete"),
  });
};

export const useUpdateCustodian = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idx, data }) =>
      studentServices.updateCustodian({ idx, data }),
    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({ queryKey: ["custodians"] });

      if (vars.data.student_idx) {
        queryClient.invalidateQueries({
          queryKey: ["student-custodians", vars.data.student_idx],
        });
      }
    },
  });
};

export const useDeleteCustodian = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idx }) => studentServices.deleteCustodian({ idx }),
    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({ queryKey: ["custodians"] });
      if (vars.studentIdx) {
        queryClient.invalidateQueries({
          queryKey: ["student-custodians", vars.studentIdx],
        });
      }
    },
  });
};

/* Enrollment related to student api */
export const useEnrollStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idx, course_class_idx, status, comment }) =>
      studentServices.enrollStudent({ idx, course_class_idx, status, comment }),
    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({ queryKey: ["student", vars.idx] });
      queryClient.invalidateQueries({ queryKey: ["course-classes"] });
    },
    onError: (err) => toast.error(err.message || "Failed to enroll"),
  });
};

export const useUnenrollStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idx, course_class_idx }) =>
      studentServices.unenrollStudent({ idx, course_class_idx }),
    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({ queryKey: ["student", vars.idx] });
      queryClient.invalidateQueries({ queryKey: ["course-classes"] });
    },
    onError: (err) => toast.error(err.message || "Failed to unenroll"),
  });
};

export const useStudentEnrollments = (studentIdx) =>
  useQuery({
    queryKey: ["student-enrollments", studentIdx],
    queryFn: () => studentServices.getStudentEnrollments(studentIdx),
    enabled: !!studentIdx,
  });

/* Enrollments (generic) related to enrollment app */
export const useEnrollments = ({
  page = 1,
  page_size = 10,
  search = "",
} = {}) =>
  useQuery({
    queryKey: ["enrollments", page, page_size, search],
    queryFn: () =>
      enrollmentServices.listEnrollments({ page, page_size, search }),
    keepPreviousData: true,
  });

export const useCreateEnrollment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => enrollmentServices.createEnrollment(data),
    onSuccess: (_res, vars) => {
      // invalidate lists that matter
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({
        queryKey: ["student-enrollments", vars.student_idx],
      });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["course-classes"] });
    },
    onError: (err) => {
      console.log("error", err);
    },
  });
};

export const useUpdateEnrollment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idx, data }) =>
      enrollmentServices.updateEnrollment({ idx, data }),
    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      if (vars.data?.student_idx)
        queryClient.invalidateQueries({
          queryKey: ["student-enrollments", vars.data.student_idx],
        });
    },
  });
};

export const useDeleteEnrollment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idx, comment }) =>
      enrollmentServices.deleteEnrollment({ idx, comment }),
    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      // If frontend tracked student idx, invalidate
      if (vars.student_idx)
        queryClient.invalidateQueries({
          queryKey: ["student-enrollments", vars.student_idx],
        });
    },
  });
};

/* helper: list course-classes (if not present) */
export const useCourseClasses = ({
  page = 1,
  page_size = 100,
  search = "",
} = {}) =>
  useQuery({
    queryKey: ["course-classes", page, page_size, search],
    queryFn: () => listCourseClasses({ page, page_size, search }),
    keepPreviousData: true,
  });
