"use client";

import * as React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

interface ComboBoxProps {
  options: string[];
  placeholder: string;
  onChange?: (value: string) => void;
}

export default function ComboBox({ options, placeholder, onChange }: ComboBoxProps) {
  return (
    <Autocomplete
      disablePortal
      options={options}
      onChange={(event, newValue) => onChange?.(newValue || "")}
      sx={{
        width: "100%",
        "& .MuiOutlinedInput-root": {
          padding: "6px 10px",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          "& fieldset": { border: "none" },
          "&:hover": { borderColor: "#94a3b8" },
          "&.Mui-focused": { borderColor: "#2563eb" },
        },
        "& .MuiInputBase-input": {
          fontSize: "15px",
          outline: "none",
        },
      }}
      renderInput={(params) => <TextField {...params} placeholder={placeholder} />}
    />
  );
}
