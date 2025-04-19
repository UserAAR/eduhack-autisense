// Authentication JavaScript

import { signIn, signOut, registerParent, registerTeacher, checkUser } from "./supabase.js"

document.addEventListener("DOMContentLoaded", () => {
  // Set up auth tabs
  const authTabs = document.querySelectorAll(".auth-tab")
  const authForms = document.querySelectorAll(".auth-form")

  authTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remove active class from all tabs and forms
      authTabs.forEach((t) => t.classList.remove("active"))
      authForms.forEach((f) => f.classList.remove("active"))

      // Add active class to current tab
      tab.classList.add("active")

      // Show corresponding form
      const targetForm = document.getElementById(tab.dataset.target)
      if (targetForm) {
        targetForm.classList.add("active")
      }
    })
  })

  // Handle parent login form submission
  const parentLoginForm = document.getElementById("parent-login-form")
  if (parentLoginForm) {
    parentLoginForm.addEventListener("submit", async (event) => {
      event.preventDefault()

      const email = document.getElementById("parent-email").value
      const password = document.getElementById("parent-password").value
      const messageElement = document.getElementById("parent-login-message")

      try {
        // Clear previous messages
        messageElement.textContent = "Logging in..."
        messageElement.className = "auth-message"

        // Sign in with Supabase
        const { user, error } = await signIn(email, password)

        if (error) {
          throw error
        }

        // Check if user is a parent
        if (user && user.user_metadata && user.user_metadata.role === "parent") {
          messageElement.textContent = "Login successful! Redirecting..."
          messageElement.className = "auth-message success"

          // Redirect to parent dashboard
          setTimeout(() => {
            window.location.href = "parent.html"
          }, 1500)
        } else {
          // Not a parent account
          messageElement.textContent = "This is not a parent account. Please use the correct login tab."
          messageElement.className = "auth-message error"
        }
      } catch (error) {
        messageElement.textContent = error.message || "Failed to login. Please check your credentials."
        messageElement.className = "auth-message error"
      }
    })
  }

  // Handle teacher login form submission
  const teacherLoginForm = document.getElementById("teacher-login-form")
  if (teacherLoginForm) {
    teacherLoginForm.addEventListener("submit", async (event) => {
      event.preventDefault()

      const email = document.getElementById("teacher-email").value
      const password = document.getElementById("teacher-password").value
      const messageElement = document.getElementById("teacher-login-message")

      try {
        // Clear previous messages
        messageElement.textContent = "Logging in..."
        messageElement.className = "auth-message"

        // Sign in with Supabase
        const { user, error } = await signIn(email, password)

        if (error) {
          throw error
        }

        // Check if user is a teacher
        if (user && user.user_metadata && user.user_metadata.role === "teacher") {
          messageElement.textContent = "Login successful! Redirecting..."
          messageElement.className = "auth-message success"

          // Redirect to teacher dashboard
          setTimeout(() => {
            window.location.href = "teacher.html"
          }, 1500)
        } else {
          // Not a teacher account
          messageElement.textContent = "This is not a teacher account. Please use the correct login tab."
          messageElement.className = "auth-message error"
        }
      } catch (error) {
        messageElement.textContent = error.message || "Failed to login. Please check your credentials."
        messageElement.className = "auth-message error"
      }
    })
  }

  // Handle parent registration form submission
  const parentRegisterForm = document.getElementById("parent-register-form")
  if (parentRegisterForm) {
    parentRegisterForm.addEventListener("submit", async (event) => {
      event.preventDefault()

      const name = document.getElementById("parent-name").value
      const email = document.getElementById("parent-email").value
      const password = document.getElementById("parent-password").value
      const confirmPassword = document.getElementById("parent-confirm-password").value
      const ageRangeElement = document.querySelector(".option-card.selected")
      const termsChecked = document.getElementById("terms").checked
      const messageElement = document.getElementById("parent-register-message")

      // Validate form
      if (password !== confirmPassword) {
        messageElement.textContent = "Passwords do not match."
        messageElement.className = "auth-message error"
        return
      }

      if (!ageRangeElement) {
        messageElement.textContent = "Please select your child's age range."
        messageElement.className = "auth-message error"
        return
      }

      if (!termsChecked) {
        messageElement.textContent = "You must agree to the Terms of Service and Privacy Policy."
        messageElement.className = "auth-message error"
        return
      }

      try {
        // Clear previous messages
        messageElement.textContent = "Creating your account..."
        messageElement.className = "auth-message"

        // Register parent with Supabase
        const { user, error } = await registerParent(email, password, name)

        if (error) {
          throw error
        }

        messageElement.textContent = "Registration successful! Redirecting to login..."
        messageElement.className = "auth-message success"

        // Redirect to login page
        setTimeout(() => {
          window.location.href = "login.html"
        }, 2000)
      } catch (error) {
        messageElement.textContent = error.message || "Failed to register. Please try again."
        messageElement.className = "auth-message error"
      }
    })
  }

  // Handle teacher registration form submission (if on the teacher registration page)
  const teacherRegisterForm = document.getElementById("teacher-register-form")
  if (teacherRegisterForm) {
    teacherRegisterForm.addEventListener("submit", async (event) => {
      event.preventDefault()

      const name = document.getElementById("teacher-name").value
      const email = document.getElementById("teacher-email").value
      const password = document.getElementById("teacher-password").value
      const confirmPassword = document.getElementById("teacher-confirm-password").value
      const specialization = document.getElementById("teacher-specialization").value
      const experience = Number.parseInt(document.getElementById("teacher-experience").value, 10)
      const bio = document.getElementById("teacher-bio").value
      const qualifications = document
        .getElementById("teacher-qualifications")
        .value.split(",")
        .map((q) => q.trim())
      const termsChecked = document.getElementById("teacher-terms").checked
      const messageElement = document.getElementById("teacher-register-message")

      // Validate form
      if (password !== confirmPassword) {
        messageElement.textContent = "Passwords do not match."
        messageElement.className = "auth-message error"
        return
      }

      if (!specialization) {
        messageElement.textContent = "Please enter your specialization."
        messageElement.className = "auth-message error"
        return
      }

      if (isNaN(experience) || experience < 0) {
        messageElement.textContent = "Please enter valid years of experience."
        messageElement.className = "auth-message error"
        return
      }

      if (!termsChecked) {
        messageElement.textContent = "You must agree to the Terms of Service and Privacy Policy."
        messageElement.className = "auth-message error"
        return
      }

      try {
        // Clear previous messages
        messageElement.textContent = "Creating your account..."
        messageElement.className = "auth-message"

        // Register teacher with Supabase
        const { user, error } = await registerTeacher(
          email,
          password,
          name,
          specialization,
          experience,
          bio,
          qualifications,
        )

        if (error) {
          throw error
        }

        messageElement.textContent = "Registration successful! Redirecting to login..."
        messageElement.className = "auth-message success"

        // Redirect to login page
        setTimeout(() => {
          window.location.href = "login.html"
        }, 2000)
      } catch (error) {
        messageElement.textContent = error.message || "Failed to register. Please try again."
        messageElement.className = "auth-message error"
      }
    })
  }

  // Check if user is already logged in
  checkAuthStatus()
})

// Check authentication status
async function checkAuthStatus() {
  try {
    const user = await checkUser()

    if (user) {
      // User is logged in
      const currentPage = window.location.pathname.split("/").pop()

      // Redirect if on login or register page
      if (currentPage === "login.html" || currentPage === "register.html" || currentPage === "teacher-register.html") {
        // Check user role and redirect accordingly
        if (user.user_metadata && user.user_metadata.role === "parent") {
          window.location.href = "parent.html"
        } else if (user.user_metadata && user.user_metadata.role === "teacher") {
          window.location.href = "teacher.html"
        }
      }
    } else {
      // User is not logged in
      const currentPage = window.location.pathname.split("/").pop()

      // Redirect if on protected pages
      const protectedPages = ["parent.html", "teacher.html", "lesson.html", "games.html", "ai.html"]
      if (protectedPages.includes(currentPage)) {
        window.location.href = "login.html"
      }
    }
  } catch (error) {
    console.error("Error checking authentication status:", error)
  }
}

// Handle logout
const logoutButton = document.getElementById("logout-button")
if (logoutButton) {
  logoutButton.addEventListener("click", async (event) => {
    event.preventDefault()

    try {
      await signOut()
      window.location.href = "login.html"
    } catch (error) {
      console.error("Error signing out:", error)
    }
  })
}
