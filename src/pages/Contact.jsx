import { useState } from "react";

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);

    alert("Message sent successfully 🚀");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div style={{ padding: "40px", maxWidth: "1000px", margin: "auto" }}>
      
      <h1 style={{ fontWeight: "700", marginBottom: "10px" }}>
        Contact Us
      </h1>

      <p style={{ color: "#555", marginBottom: "30px" }}>
        Have questions, feedback, or need support? We’d love to hear from you!
      </p>

      <div
        style={{
          display: "flex",
          gap: "30px",
          flexWrap: "wrap",
        }}
      >
        {/* LEFT - FORM */}
        <div style={{ flex: 1, minWidth: "300px" }}>
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
            }}
          >
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              required
              style={styles.input}
            />

            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={form.email}
              onChange={handleChange}
              required
              style={styles.input}
            />

            <textarea
              name="message"
              placeholder="Your Message"
              rows="5"
              value={form.message}
              onChange={handleChange}
              required
              style={styles.textarea}
            />

            <button type="submit" style={styles.button}>
              Send Message 🚀
            </button>
          </form>
        </div>

        {/* RIGHT - INFO */}
        <div style={{ flex: 1, minWidth: "250px" }}>
          <div style={styles.infoCard}>
            <h3>📧 Email</h3>
            <p>support@xmasterlive.com</p>
          </div>

          <div style={styles.infoCard}>
            <h3>🌍 Location</h3>
            <p>India</p>
          </div>

          <div style={styles.infoCard}>
            <h3>⏰ Support</h3>
            <p>24/7 Customer Support Available</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  textarea: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  button: {
    padding: "12px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  infoCard: {
    background: "#f8f9fa",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "15px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },
};

export default Contact;