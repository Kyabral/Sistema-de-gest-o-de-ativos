import React from 'react';

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  className?: string;
  labelClassName?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ label, id, className, labelClassName, ...rest }) => {
  return (
    <div>
      <label 
        htmlFor={id} 
        className={labelClassName || "block mb-2 text-sm font-medium text-gray-900 dark:text-white"}
      >
        {label}
      </label>
      <input
        type="date"
        id={id}
        className={className || "input-style"}
        {...rest}
      />
    </div>
  );
};

export default DatePicker;