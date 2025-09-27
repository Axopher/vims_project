// src/features/employees/Career.jsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listCareer,
  createCareer,
  updateCareer,
  deleteCareer,
} from "../../services/apiEmployee";
import Spinner from "../../ui/Spinner";
import Button from "../../ui/Button";
import CareerForm from "./CareerForm";
import toast from "react-hot-toast";
import ConfirmDialog from "../../ui/ConfirmDialog";
import { formatDateISO } from "../../utils/helpers";
import Table from "../../ui/Table";

export default function Career({ employeeIdx }) {
  const queryClient = useQueryClient();
  const {
    data = [],
    isFetching,
    error,
  } = useQuery({
    queryKey: ["career", employeeIdx],
    queryFn: () => listCareer(employeeIdx),
  });

  const [deleteId, setDeleteId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [isModalFormOpen, setIsModalFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const { mutateAsync: addCareer, isPending: isAdding } = useMutation({
    mutationFn: (data) => createCareer({ employeeIdx, data }),
    onSuccess: () => {
      queryClient.invalidateQueries(["career", employeeIdx]);
      setIsModalFormOpen(false);
      setFormErrors({});
    },
    onError: (err) => {
      if (err.response?.data && typeof err.response.data === "object") {
        setFormErrors(err.response.data); // pass backend validation errors to form
      } else {
        toast.error(err.message || "Failed to create career");
      }
    },
  });

  const { mutateAsync: editCareer, isPending: isEditing } = useMutation({
    mutationFn: ({ idx, data }) => updateCareer({ employeeIdx, idx, data }),
    onSuccess: () => {
      queryClient.invalidateQueries(["career", employeeIdx]);
      setIsModalFormOpen(false);
      setEditData(null);
      setFormErrors({});
    },
    onError: (err) => {
      if (err.response?.data && typeof err.response.data === "object") {
        setFormErrors(err.response.data); // pass backend validation errors to form
      } else {
        toast.error(err.message || "Failed to create career");
      }
    },
  });

  const { mutateAsync: removeCareer, isPending: isDeleting } = useMutation({
    mutationFn: (idx) => deleteCareer({ employeeIdx, idx }),
    onSuccess: () => {
      toast.success("Career deleted");
      queryClient.invalidateQueries(["career", employeeIdx]);
      setIsConfirmOpen(false);
    },
    onError: (err) => toast.error(err.message || "Failed to delete"),
  });

  const confirmDelete = (id) => {
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (deleteId) removeCareer(deleteId);
  };

  const handleFormClose = () => {
    setIsModalFormOpen(false);
    setEditData(null);
  };

  const handleFormSubmit = async (formData) => {
    const payload = { ...formData };
    if (!payload.end_date) delete payload.end_date;

    try {
      if (editData) {
        await editCareer({ idx: editData.idx, data: payload });
      } else {
        await addCareer(payload);
      }
    } catch (err) {
      console.error("Form submit failed:", err);
      // optional: toast.error(err.message);
    }
  };

  if (isFetching) return <Spinner />;
  if (error) return <p className="text-red-500">Failed to load career</p>;

  const careerRecords = data?.data || [];

  const columns = [
    { header: "Function", accessor: "function" },
    { header: "Competence", accessor: "competence_area" },
    { header: "Start Date", render: (row) => formatDateISO(row.start_date) },
    { header: "End Date", render: (row) => formatDateISO(row.end_date) },
    { header: "Salary", accessor: "salary" },
    {
      header: "",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setEditData(row);
              setIsModalFormOpen(true);
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            disabled={isDeleting}
            onClick={() => confirmDelete(row.idx)}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-4 flex justify-between">
        <h3 className="text-lg font-semibold">Career History</h3>
        <Button onClick={() => setIsModalFormOpen(true)}>+ Add</Button>
      </div>

      {careerRecords.length === 0 ? (
        <p className="text-gray-500">No career records.</p>
      ) : (
        <Table columns={columns} data={careerRecords} isLoading={isFetching} />
      )}

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirm}
        isLoading={isDeleting}
        title="Delete a Career Record"
        message="Are you sure you want to delete this career record?"
      />

      <CareerForm
        key={editData?.idx || "create"}
        isOpen={isModalFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        defaultValues={editData || undefined}
        isEdit={!!editData}
        isSubmitting={isAdding || isEditing}
        serverErrors={formErrors}
      />
    </div>
  );
}
