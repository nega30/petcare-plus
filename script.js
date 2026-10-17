
const pages = document.querySelectorAll(".page");
const navItems = document.querySelectorAll(".nav-item");
const toast = document.getElementById("toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function showPage(pageId) {
  const target = document.getElementById(pageId);
  if (!target) return;

  pages.forEach(page => page.classList.toggle("active", page.id === pageId));
  navItems.forEach(item => item.classList.toggle("active", item.dataset.page === pageId));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("[data-page]").forEach(button => {
  button.addEventListener("click", event => {
    event.preventDefault();
    showPage(button.dataset.page);
  });
});

// Care task completion
document.querySelectorAll("[data-task]").forEach(button => {
  button.addEventListener("click", () => {
    const card = button.closest(".care-card");
    const completed = button.classList.toggle("completed");
    card.classList.toggle("task-done", completed);
    button.setAttribute("aria-pressed", String(completed));
    button.setAttribute("aria-label", completed ? "Mark task incomplete" : "Mark task complete");
    button.textContent = completed ? "✓" : "✓";
    showToast(completed ? "Great job! Care task completed 🐾" : "Care task marked incomplete");
  });
});

// Service cards open booking with the selected service
document.querySelectorAll("[data-service]").forEach(button => {
  button.addEventListener("click", () => {
    document.getElementById("service").value = button.dataset.service;
    showPage("booking");
  });
});

// Select a time
document.querySelectorAll(".time-option").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".time-option").forEach(option => {
      option.classList.remove("selected");
      option.setAttribute("aria-pressed", "false");
    });
    button.classList.add("selected");
    button.setAttribute("aria-pressed", "true");
  });
});

// Prevent selecting past dates
const dateInput = document.getElementById("appointment-date");
const today = new Date();
const localDate = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, "0"),
  String(today.getDate()).padStart(2, "0")
].join("-");
dateInput.min = localDate;
dateInput.value = localDate;

// Demo appointment confirmation
document.getElementById("booking-form").addEventListener("submit", event => {
  event.preventDefault();

  const pet = document.getElementById("pet-name").value.trim();
  const service = document.getElementById("service").value;
  const date = dateInput.value;
  const time = document.querySelector(".time-option.selected")?.textContent;

  if (!pet || !date || !time) {
    showToast("Please complete all required fields.");
    return;
  }

  const formattedDate = new Date(`${date}T12:00:00`).toLocaleDateString(
    undefined,
    { year: "numeric", month: "long", day: "numeric" }
  );

  const result = document.getElementById("booking-result");
  result.innerHTML = `
    <h3>🎉 Appointment details</h3>
    <strong>${escapeHTML(pet)}</strong><br>
    ${escapeHTML(service)}<br>
    ${escapeHTML(formattedDate)} at ${escapeHTML(time)}<br>
    <span class="muted">Demo confirmation only — no clinic has been contacted.</span>
  `;
  result.hidden = false;
  result.scrollIntoView({ behavior: "smooth", block: "nearest" });
  showToast("Your demo appointment is ready!");
});

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

/* PetCare+ AI/ML Recommendation Integration */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("pet-ai-form");
  const result = document.getElementById("ai-result");

  if (!form || !result) {
    console.warn(
      "PetCare+ AI form not connected yet. Check the HTML element IDs."
    );
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector(
      'button[type="submit"]'
    );

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Getting recommendation...";
    }

    result.textContent = "Analyzing your pet's details...";

    const formData = new FormData(form);

    const petDetails = {
      species: formData.get("species"),
      age_group: formData.get("age_group"),
      activity_level: formData.get("activity_level"),
      weight_status: formData.get("weight_status")
    };

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/recommend",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(petDetails)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to get a recommendation.");
      }

      const friendlyNames = {
        exercise: "Exercise and activity",
        weight_management: "Weight management",
        health_monitoring: "Health monitoring",
        balanced_care: "Balanced everyday care",
        play_enrichment: "Play and enrichment"
      };

      result.replaceChildren();

      const heading = document.createElement("h3");
      heading.textContent = "Your PetCare+ AI Recommendation";

      const recommendation = document.createElement("p");
      recommendation.textContent =
        friendlyNames[data.recommendation] ||
        data.recommendation.replaceAll("_", " ");

      const notice = document.createElement("small");
      notice.textContent =
        data.notice ||
        "Educational demo only. Consult a veterinarian for health concerns.";

      result.append(heading, recommendation, notice);
    } catch (error) {
      result.textContent =
        "Could not connect to the AI service. Make sure the Flask backend is running. " +
        error.message;
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Get AI Recommendation";
      }
    }
  });
});
