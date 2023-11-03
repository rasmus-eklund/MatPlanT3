import type { FieldError } from "react-hook-form";

type Props = { error: FieldError | undefined; className?: string };

const FormError = ({ error, className }: Props) => {
  if (error?.message)
    return (
      <p className={`rounded-md bg-c1 bg-opacity-30 px-2 text-sm ${className}`}>
        {error.message}
      </p>
    );
};

export default FormError;
