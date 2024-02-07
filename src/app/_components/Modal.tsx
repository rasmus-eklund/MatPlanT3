import { ReactNode, forwardRef } from "react";

type Props = { children: ReactNode; toggleModal: () => void };
const Modal = forwardRef<HTMLDialogElement, Props>(
  ({ children, toggleModal }, ref) => {
    return (
      <dialog
        className="bg-c3 backdrop:backdrop-blur"
        ref={ref}
        onClick={(e) => {
          if (e.currentTarget === e.target) {
            toggleModal();
          }
        }}
      >
        <div className="h-full w-full">{children}</div>
      </dialog>
    );
  },
);

export default Modal;
