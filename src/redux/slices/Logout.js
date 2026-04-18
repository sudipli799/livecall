export const handleLogout = (navigate) => {
  try {
    // 🧹 Clear storage
    localStorage.clear();
    sessionStorage.clear();

    // 🪪 Optional: token remove separately
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // 🔄 Redirect to login
    navigate("/login");

  } catch (error) {
    console.log("Logout Error:", error);
  }
};