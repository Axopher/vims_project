import { useForm } from "react-hook-form";
import { useLogin } from "../features/authentication/useLogin";
import Button from "../ui/Button";
import Input from "../ui/form/Input";
import Spinner from "../ui/Spinner";
import FormRow from "../ui/form/FormRow";
import { useLocation } from "react-router-dom";
import { Landmark } from "lucide-react";

export default function LoginPage() {
  const { login, isLoggingIn } = useLogin();
  const { register, handleSubmit, formState } = useForm();
  const { errors } = formState;

  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  function onSubmit({ email, password }) {
    login({ email, password, redirectTo: from });
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-200">
        {/* Logo + Branding */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full">
            <Landmark className="h-10 w-10 text-primary" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Welcome to VIMS
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Log in to continue
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormRow label="Email" error={errors?.email?.message}>
            <Input
              type="email"
              id="email"
              autoComplete="email"
              disabled={isLoggingIn}
              {...register("email", {
                required: "Email address is required",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Please enter a valid email address",
                },
              })}
            />
          </FormRow>

          <FormRow label="Password" error={errors?.password?.message}>
            <Input
              type="password"
              id="password"
              autoComplete="current-password"
              disabled={isLoggingIn}
              {...register("password", {
                required: "Password is required",
              })}
            />
          </FormRow>

          <Button
            type="submit"
            disabled={isLoggingIn}
            fullWidth
            className="mt-2"
          >
            {!isLoggingIn ? "Log in" : <Spinner color="white" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
