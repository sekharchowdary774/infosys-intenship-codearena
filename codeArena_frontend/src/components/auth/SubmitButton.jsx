function SubmitButton({ text, loading }) {
  const handleClick = () => {
    console.log("🔥 BUTTON CLICKED");
  };

  return (
    <button
      type="submit"
      className="submit-btn"
      disabled={loading}
      onClick={handleClick}
    >
      {loading ? "Please Wait..." : text}
    </button>
  );
}

export default SubmitButton;