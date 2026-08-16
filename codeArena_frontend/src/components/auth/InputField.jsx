function InputField({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  error,
}) {
  return (
    <div className="input-group">
      <label>{label}</label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />

      {error && <span className="error">{error}</span>}
    </div>
  );
}

export default InputField;