function SubmitButton({ text, loading }) {
  return (
    <button className="submit-btn" disabled={loading}>
      {loading ? "Please Wait..." : text}
    </button>
  );
}

export default SubmitButton;