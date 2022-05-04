import { observer } from 'mobx-react-lite';
import React from 'react';

interface RangeSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export const RangeSlider: React.FC<RangeSliderProps> = observer(
  ({ min, max, value, onChange, className }) => {
    return (
      <input
        type={'range'}
        className={className}
        min={min}
        max={max}
        value={value}
        onInput={(e: React.FormEvent<HTMLInputElement>) =>
          onChange(parseInt(e.currentTarget.value))
        }
      ></input>
    );
  }
);
