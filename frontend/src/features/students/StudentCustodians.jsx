// src/features/students/StudentCustodians.jsx
import { useState } from "react";
import {
  useStudentCustodians,
  useCreateCustodian,
  useUpdateCustodian,
  useDeleteCustodian,
} from "./useStudents";

import Table from "../../ui/Table";
import Button from "../../ui/Button";
import CustodianForm from "./CustodianForm";
import ConfirmDialog from "../../ui/ConfirmDialog";
import Spinner from "../../ui/Spinner";

export default function StudentCustodians({ studentIdx }) {
  const {
    data: custodianRecords = [],
    isFetching,
    error,
  } = useStudentCustodians(studentIdx);

  const createCustodian = useCreateCustodian();
  const updateCustodian = useUpdateCustodian();
  const deleteCustodian = useDeleteCustodian();

  const [deleteIdx, setDeleteIdx] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [isModalFormOpen, setIsModalFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const confirmDelete = (idx) => {
    setDeleteIdx(idx);
    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (deleteIdx) {
      deleteCustodian.mutate({ idx: deleteIdx, studentIdx });
    }
    setIsConfirmOpen(false);
    setDeleteIdx(null);
  };

  const handleFormClose = () => {
    setIsModalFormOpen(false);
    setEditData(null);
    setFormErrors({});
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editData) {
        await updateCustodian.mutateAsync({
          idx: editData.idx,
          data: { ...formData, student_idx: studentIdx },
        });
      } else {
        await createCustodian.mutateAsync({
          data: { ...formData, student_idx: studentIdx },
        });
      }
      setIsModalFormOpen(false);
      setEditData(null);
      setFormErrors({});
    } catch (err) {
      if (err.response?.data && typeof err.response.data === "object") {
        setFormErrors(err.response.data);
      } else {
        console.error("Failed:", err);
      }
    }
  };

  if (isFetching) return <Spinner />;
  if (error) return <p className="text-red-500">Failed to load custodians.</p>;

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Relation", accessor: "relation" },
    { header: "Phone", accessor: "phone" },
    { header: "Email", accessor: "email" },
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
            disabled={deleteCustodian.isPending}
            onClick={() => confirmDelete(row.idx)}
          >
            {deleteCustodian.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-4 flex justify-between">
        <h3 className="text-lg font-semibold">Custodian Records</h3>
        <Button
          onClick={() => {
            setIsModalFormOpen(true);
          }}
        >
          + Add
        </Button>
      </div>

      <Table columns={columns} data={custodianRecords} isLoading={isFetching} />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirm}
        isLoading={deleteCustodian.isPending}
        title="Delete a Career Record"
        message="Are you sure you want to delete this custodian record?"
      />

      <CustodianForm
        key={editData?.idx || "create"}
        defaultValues={editData || undefined}
        onSubmit={handleFormSubmit}
        isSubmitting={updateCustodian.isPending || createCustodian.isPending}
        serverErrors={formErrors}
        isOpen={isModalFormOpen}
        onClose={handleFormClose}
        isEdit={!!editData}
      />
    </div>
  );
}
