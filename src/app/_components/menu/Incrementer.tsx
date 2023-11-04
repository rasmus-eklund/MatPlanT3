import Icon from "../icons/Icon";

type Props = {
  value: number;
  disabled: boolean;
  callback: (value: number) => void;
};

const Incrementer = ({ value, disabled, callback }: Props) => {
  const handleChange = ({ minus }: { minus: boolean }) => {
    const newValue = minus ? Math.max(value - 1, 1) : value + 1;
    callback(newValue);
  };
  return (
    <div className="flex select-none items-center gap-1 p-2">
      <button disabled={disabled} onClick={() => handleChange({ minus: true })}>
        <Icon icon="minus" />
      </button>
      <p className="text-lg">{value}</p>
      <button
        disabled={disabled}
        onClick={() => handleChange({ minus: false })}
      >
        <Icon icon="plus" />
      </button>
    </div>
  );
};

export default Incrementer;
