// pages/ActivationPage.jsx
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { activateAccount as activateAccountApi } from "../services/apiAuth";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Spinner from "../ui/Spinner";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";

export default function ActivationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { logout: logoutFromContext } = useAuth();

  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  // Use a mutation to handle the API call
  const mutation = useMutation({
    mutationFn: activateAccountApi,
    onSuccess: (data) => {
      toast.success(data.detail);
      logoutFromContext();
      // Optional: Redirect to the login page after successful activation
      navigate(`/login`);
      toast.success("You can now login using VIMS login portal.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    if (!uid || !token) {
      toast.error("Activation link is missing parameters.");
      return;
    }
    mutation.mutate({ uid, token, password });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="m-auto w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Activate Your Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="New Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your new password"
          />
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Confirm your new password"
          />
          <Button type="submit" disabled={mutation.isPending} fullWidth>
            {!mutation.isPending ? (
              "Activate Account"
            ) : (
              <Spinner color="white" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
