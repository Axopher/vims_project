// src/features/courses/AssignInstructorModal.jsx
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Modal from "../../ui/Modal";
import Select from "../../ui/form/Select";
import Button from "../../ui/Button";
import { useInstructors } from "./useInstructors";
import { useAssignInstructor } from "./useCourseClasses";
import { toast } from "react-hot-toast";

export default function AssignInstructorModal({ classData, onClose }) {
  const qc = useQueryClient();
  const [selectedValue, setSelectedValue] = useState("");

  const assign = useAssignInstructor();

  // load instructors (this is fine to always call; small dataset)
  const {
    data: instrData,
    isPending: instrLoading,
    error: instrError,
  } = useInstructors({ page: 1, page_size: 999 });

  // instrData might be envelope { data: [...] } or a raw array
  const rawInstructors =
    instrData?.data ?? (Array.isArray(instrData) ? instrData : []);

  // filter out already assigned instructors
  const assignedIdxs = new Set(
    (classData?.instructors || []).map((i) => i.idx),
  );
  const available = rawInstructors.filter((i) => !assignedIdxs.has(i.idx));

  const options = useMemo(
    () => available.map((i) => ({ value: i.idx, label: i.name })),
    [available],
  );

  useEffect(() => {
    // reset selection when modal/class changes
    setSelectedValue("");
  }, [classData]);

  if (!classData) return null;

  const handleAssign = async () => {
    if (!classData) {
      // This check is the most important part to prevent the crash
      toast.error("Class data is missing. Cannot assign instructor.");
      return;
    }

    if (!selectedValue) {
      toast.error("Please select an instructor to assign.");
      return;
    }

    try {
      await assign.mutateAsync({
        classIdx: classData.idx,
        instructor_idx: selectedValue,
      });

      toast.success("Instructor assigned");
      onClose();

      // invalidate queries to refresh listing
      qc.invalidateQueries({ queryKey: ["course-classes"] });
      qc.invalidateQueries({
        queryKey: ["course", classData.course?.idx || ""],
      });
      qc.invalidateQueries({ queryKey: ["courses"] });
      qc.invalidateQueries({ queryKey: ["instructors"] });

      // reset select so user can assign another if needed
      setSelectedValue("");
    } catch (err) {
      toast.error(
        err?.response?.data?.detail || err?.message || "Failed to assign",
      );
    }
  };

  return (
    <Modal
      isOpen={!!classData}
      onClose={onClose}
      title={`Assign Instructor — ${classData?.code || ""}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleAssign} isLoading={assign.isPending}>
            Assign
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-xs font-medium text-gray-600">
            Pick instructor
          </label>

          <Select
            value={selectedValue}
            onChange={(e) => setSelectedValue(e.target.value)}
            options={options}
            disabled={instrLoading}
            className="mt-1"
            required
          />

          {instrError && (
            <div className="mt-2 text-sm text-red-600">
              Failed to load instructors.
            </div>
          )}
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700">
            Assigned instructors
          </h4>
          {!classData.instructors || classData.instructors.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">
              No instructors assigned.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {classData.instructors.map((ins) => (
                <li
                  key={ins.idx}
                  className="flex items-center justify-between gap-4 rounded-md border p-2"
                >
                  <div className="text-sm">{ins.name}</div>
                  <div className="text-xs text-gray-500">Assigned</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}
