import type { FieldError } from "react-hook-form";

const FormError = ({ error }: { error: FieldError | undefined }) => {
  if (error?.message)
    return (
      <p className="rounded-md bg-c1 bg-opacity-30 px-2 text-sm">
        {error.message}
      </p>
    );
};

export default FormError;
