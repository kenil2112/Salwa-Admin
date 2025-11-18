import { Select } from "antd";
import { useState } from "react";

function SelectFiled({ value, setValue, options, label }: any) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative">
      {/* Floating Label */}
      <label
        className={`absolute left-3 z-[1] bg-white px-1 text-gray-500 
          pointer-events-none transition-all duration-200
          ${focused || value
            ? "-top-2 text-xs !text-primary px-1"
            : "top-[18px] text-base !text-[#999]"
          }`}
      >
        {label}
      </label>

      {/* Antd Select */}
      <Select
        value={value}
        onChange={(val) => setValue(val)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full !text-[17px] !h-[62px] floating-select-filed"
        options={options}
      />
    </div>
  );
}

export default SelectFiled;
