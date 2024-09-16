import React, { useState } from "react";

interface ToggleSwitchProps {
  label: string;
  setIsRandomize: (selected: Boolean) => void;
  isRandomize: Boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = (props) => {
  const { label, setIsRandomize, isRandomize } = props;
  const [isChecked, setIsChecked] = useState(false);

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(event.target.checked);
    setIsRandomize(event.target.checked);
  };

  return (
    <div className="toogle-container">
      {label}{" "}
      <div className="toggle-switch">
        <input
          type="checkbox"
          className="checkbox"
          name={label}
          id={label}
          checked={isChecked}
          onChange={handleToggle}
        />
        <label className="label" htmlFor={label}>
          <span className="inner" />
          <span className="switch" />
        </label>
      </div>
    </div>
  );
};

export default ToggleSwitch;
