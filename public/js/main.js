// Custom JavaScript for Role-Based Authentication Project

document.addEventListener("DOMContentLoaded", function () {
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        const navbarHeight = document.querySelector(".navbar").offsetHeight;
        const targetPosition = target.offsetTop - navbarHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  // Add scroll effect to navbar
  let lastScrollTop = 0;
  const navbar = document.querySelector(".navbar");

  window.addEventListener("scroll", function () {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Change navbar background on scroll
    if (scrollTop > 50) {
      navbar.style.background =
        "linear-gradient(135deg, rgba(79, 70, 229, 0.95), rgba(124, 58, 237, 0.95))";
      navbar.style.backdropFilter = "blur(10px)";
    } else {
      navbar.style.background =
        "linear-gradient(135deg, var(--primary-color), var(--secondary-color))";
      navbar.style.backdropFilter = "none";
    }

    // Hide/show navbar on scroll (optional)
    if (scrollTop > lastScrollTop && scrollTop > 100) {
      // Scrolling down
      navbar.style.transform = "translateY(-100%)";
    } else {
      // Scrolling up
      navbar.style.transform = "translateY(0)";
    }

    lastScrollTop = scrollTop;
  });

  // Add loading animation
  window.addEventListener("load", function () {
    document.body.style.opacity = "1";
    document.body.style.transition = "opacity 0.5s ease-in-out";
  });

  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Form validation and enhancement
  const forms = document.querySelectorAll(".needs-validation");
  forms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      if (!form.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
      }
      form.classList.add("was-validated");
    });
  });

  // Auto-hide alerts after 5 seconds
  const alerts = document.querySelectorAll(".alert:not(.alert-permanent)");
  alerts.forEach((alert) => {
    setTimeout(() => {
      alert.style.opacity = "0";
      alert.style.transform = "translateY(-20px)";
      setTimeout(() => {
        alert.remove();
      }, 300);
    }, 5000);
  });

  // Add close functionality to alerts
  document.querySelectorAll(".alert .btn-close").forEach((button) => {
    button.addEventListener("click", function () {
      const alert = this.closest(".alert");
      alert.style.opacity = "0";
      alert.style.transform = "translateY(-20px)";
      setTimeout(() => {
        alert.remove();
      }, 300);
    });
  });

  // Animate counters on scroll (for dashboard stats)
  const animateCounters = () => {
    const counters = document.querySelectorAll(".stat-number[data-count]");
    counters.forEach((counter) => {
      const target = parseInt(counter.getAttribute("data-count"));
      const current = parseInt(counter.innerText);
      const increment = target / 100;

      if (current < target) {
        counter.innerText = Math.ceil(current + increment);
        setTimeout(animateCounters, 20);
      } else {
        counter.innerText = target;
      }
    });
  };

  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Add animation classes
        entry.target.classList.add("animate-in");

        // Start counter animation if it's a stat number
        if (
          entry.target.classList.contains("stat-number") &&
          entry.target.hasAttribute("data-count")
        ) {
          animateCounters();
        }

        // Unobserve after animation
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe elements for animation
  const animatedElements = document.querySelectorAll(
    ".feature-card, .dashboard-card, .stat-number"
  );
  animatedElements.forEach((el) => observer.observe(el));

  // Password visibility toggle
  document.querySelectorAll(".password-toggle").forEach((toggle) => {
    toggle.addEventListener("click", function () {
      const input = this.previousElementSibling;
      const icon = this.querySelector("i");

      if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      }
    });
  });

  // Dropdown menu enhancements
  document.querySelectorAll(".dropdown").forEach((dropdown) => {
    dropdown.addEventListener("show.bs.dropdown", function () {
      this.querySelector(".dropdown-toggle").setAttribute(
        "aria-expanded",
        "true"
      );
    });

    dropdown.addEventListener("hide.bs.dropdown", function () {
      this.querySelector(".dropdown-toggle").setAttribute(
        "aria-expanded",
        "false"
      );
    });
  });

  // Add ripple effect to buttons
  document.querySelectorAll(".btn").forEach((button) => {
    button.addEventListener("click", function (e) {
      const ripple = document.createElement("span");
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = x + "px";
      ripple.style.top = y + "px";
      ripple.classList.add("ripple");

      this.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

  // Newsletter form submission
  const newsletterForm = document.querySelector('form[action*="newsletter"]');
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = this.querySelector('input[type="email"]').value;

      // Add your newsletter subscription logic here
      console.log("Newsletter subscription for:", email);

      // Show success message
      const alert = document.createElement("div");
      alert.className = "alert alert-success mt-2";
      alert.textContent = "Thank you for subscribing to our newsletter!";
      this.appendChild(alert);

      // Reset form
      this.reset();
    });
  }

  // Search functionality (if you add a search feature)
  const searchInput = document.querySelector("#searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase();
      const searchResults = document.querySelector("#searchResults");

      // Add your search logic here
      console.log("Searching for:", searchTerm);
    });
  }

  // Dark mode toggle (optional feature)
  const darkModeToggle = document.querySelector("#darkModeToggle");
  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", function () {
      document.body.classList.toggle("dark-mode");

      // Store preference in localStorage
      const isDarkMode = document.body.classList.contains("dark-mode");
      localStorage.setItem("darkMode", isDarkMode);
    });

    // Load dark mode preference
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    }
  }

  // Mobile menu enhancements
  const navbarToggler = document.querySelector(".navbar-toggler");
  const navbarCollapse = document.querySelector(".navbar-collapse");

  if (navbarToggler && navbarCollapse) {
    navbarToggler.addEventListener("click", function () {
      this.classList.toggle("active");
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll(".navbar-nav .nav-link").forEach((link) => {
      link.addEventListener("click", function () {
        if (window.innerWidth < 992) {
          const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
            toggle: false,
          });
          bsCollapse.hide();
          navbarToggler.classList.remove("active");
        }
      });
    });
  }
});

// Utility functions
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `alert alert-${type} notification`;
  notification.textContent = message;
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.opacity = "1";
    notification.style.transform = "translateX(0)";
  }, 100);

  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.style.opacity = "0";
    notification.style.transform = "translateX(100%)";
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

// Add CSS for animations
const style = document.createElement("style");
// style.textContent = document.head.appendChild(style);

// Activity Chart
const ctx = document.getElementById("activityChart").getContext("2d");
const activityChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Activity",
        data: [12, 19, 3, 5, 2, 3, 9],
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        borderColor: "rgba(79, 70, 229, 1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0,0,0,0.1)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  },
});
