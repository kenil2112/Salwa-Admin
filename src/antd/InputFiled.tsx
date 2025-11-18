import { Input } from "antd";
import { useState } from "react";

function InputFiled({ onChange, value, label }: any) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <label
        className={`absolute left-3 z-[1] bg-white text-gray-500 pointer-events-none transition-all duration-200 
          ${
            focused || value
              ? "-top-2 text-xs !text-blue-600 px-1"
              : "top-3 text-base !text-[#999]"
          }`}
      >
        {label}
      </label>
      <Input
        className="py-2 px-2.5 !text-base h-12 w-full border border-[#999] rounded-md"
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

export default InputFiled;
