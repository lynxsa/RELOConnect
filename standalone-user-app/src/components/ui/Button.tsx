import React from 'react';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: string;
  size?: string;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  style?: any;
  textStyle?: any;
  fullWidth?: boolean;
}

export const Button = (props: ButtonProps) => {
  return (
    <div onClick={props.onPress} style={props.style}>
      {props.title}
    </div>
  );
};

export default Button;
