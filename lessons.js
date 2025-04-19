// Lessons JavaScript

import { checkUser, getChildren, getLessons, getCategories } from "./supabase.js"
import { supabase } from "./supabase.js"

document.addEventListener("DOMContentLoaded", () => {
  // Initialize sidebar toggle functionality
  initSidebar()

  // Initialize child switcher
  initChildSwitcher()

  // Check user authentication
  checkUserAuthentication()

  // Initialize lesson filters
  initLessonFilters()

  // Load categories for filter dropdown
  loadCategories()
})

// Sidebar Functionality
function initSidebar() {
  const menuToggle = document.querySelector(".menu-toggle")
  const sidebarToggle = document.querySelector(".sidebar-toggle")
  const sidebar = document.querySelector(".sidebar")

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.add("active")
    })
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.remove("active")
    })
  }

  // Close sidebar when clicking outside on mobile
  document.addEventListener("click", (event) => {
    if (window.innerWidth <= 992) {
      if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
        sidebar.classList.remove("active")
      }
    }
  })
}

// Child Switcher Functionality
function initChildSwitcher() {
  const childOptions = document.querySelectorAll(".child-option")
  const currentChildName = document.getElementById("current-child-name")

  childOptions.forEach((option) => {
    option.addEventListener("click", function () {
      // Remove active class from all options
      childOptions.forEach((opt) => opt.classList.remove("active"))

      // Add active class to clicked option
      this.classList.add("active")

      // Update child name
      const childName = this.querySelector("span").textContent
      if (currentChildName) currentChildName.textContent = `${childName}'s Journey`

      // In a real app, we would fetch lessons for the selected child here
      loadLessons(this.dataset.childId)
    })
  })
}

// Check if user is authenticated
async function checkUserAuthentication() {
  try {
    const user = await checkUser()

    if (!user) {
      // Redirect to login page if not authenticated
      window.location.href = "login.html"
      return
    }

    // Update parent name
    const parentName = user.user_metadata?.name || "Parent"
    document.getElementById("parent-name").textContent = parentName

    // Load children
    loadChildren(user.id)
  } catch (error) {
    console.error("Error checking authentication:", error)
  }
}

// Load children from Supabase
async function loadChildren(parentId) {
  try {
    const children = await getChildren(parentId)

    if (children.length === 0) {
      // No children found, show add child prompt
      showAddChildPrompt()
      return
    }

    // Update child switcher with children data
    const childSwitcher = document.querySelector(".child-switcher")
    const childDropdown = childSwitcher.querySelector(".child-dropdown")

    // Clear existing options except the "Add Child" option
    const addChildOption = childDropdown.querySelector(".add-child")
    childDropdown.innerHTML = ""
    if (addChildOption) {
      childDropdown.appendChild(addChildOption)
    }

    // Add children to dropdown
    children.forEach((child, index) => {
      const childOption = document.createElement("div")
      childOption.className = index === 0 ? "child-option active" : "child-option"
      childOption.dataset.childId = child.id

      childOption.innerHTML = `
        <img src="${child.avatar_url || `https://api.dicebear.com/6.x/avataaars-neutral/svg?seed=child${index + 1}`}" alt="Child Avatar">
        <span>${child.name}</span>
      `

      if (addChildOption) {
        childDropdown.insertBefore(childOption, addChildOption)
      } else {
        childDropdown.appendChild(childOption)
      }

      // Add click event
      childOption.addEventListener("click", function () {
        // Remove active class from all options
        childDropdown.querySelectorAll(".child-option").forEach((opt) => opt.classList.remove("active"))

        // Add active class to clicked option
        this.classList.add("active")

        // Update selected child display
        const selectedChild = childSwitcher.querySelector(".selected-child")
        if (selectedChild) {
          selectedChild.querySelector("img").src = this.querySelector("img").src
          selectedChild.querySelector("span").textContent = `${this.querySelector("span").textContent}'s Journey`
        }

        // Load lessons for this child
        loadLessons(this.dataset.childId)
      })
    })

    // Update selected child display with first child
    const firstChild = children[0]
    const selectedChild = childSwitcher.querySelector(".selected-child")
    if (selectedChild) {
      selectedChild.querySelector("img").src =
        firstChild.avatar_url || `https://api.dicebear.com/6.x/avataaars-neutral/svg?seed=child1`
      selectedChild.querySelector("span").textContent = `${firstChild.name}'s Journey`
    }

    // Load lessons for first child
    loadLessons(firstChild.id)
  } catch (error) {
    console.error("Error loading children:", error)
  }
}

// Show add child prompt
function showAddChildPrompt() {
  const lessonsContainer = document.querySelector(".lessons-container")
  if (lessonsContainer) {
    lessonsContainer.innerHTML = `
      <div class="no-children-message">
        <h2>No children found</h2>
        <p>You need to add a child to your account before you can access lessons.</p>
        <button class="btn btn-primary add-child-btn">Add Child</button>
      </div>
    `

    // Add event listener to the button
    const addChildBtn = lessonsContainer.querySelector(".add-child-btn")
    if (addChildBtn) {
      addChildBtn.addEventListener("click", () => {
        // In a real app, this would open a modal or navigate to an add child page
        console.log("Add child button clicked")
        // window.location.href = "add-child.html"
      })
    }
  }
}

// Initialize lesson filters
function initLessonFilters() {
  const searchInput = document.querySelector(".lessons-search input")
  const categorySelect = document.querySelector(".filter select[name='category']")
  const difficultySelect = document.querySelector(".filter select[name='difficulty']")
  const durationSelect = document.querySelector(".filter select[name='duration']")

  // Add event listeners to filters
  if (searchInput) {
    searchInput.addEventListener("input", filterLessons)
  }

  if (categorySelect) {
    categorySelect.addEventListener("change", filterLessons)
  }

  if (difficultySelect) {
    difficultySelect.addEventListener("change", filterLessons)
  }

  if (durationSelect) {
    durationSelect.addEventListener("change", filterLessons)
  }
}

// Load categories for filter dropdown
async function loadCategories() {
  try {
    const categories = await getCategories()

    if (categories.length === 0) {
      console.log("No categories found")
      return
    }

    // Update category filter dropdown
    const categorySelect = document.querySelector(".filter select[name='category']")
    if (categorySelect) {
      // Keep the "All Categories" option
      const allOption = categorySelect.querySelector("option[value='all']")
      categorySelect.innerHTML = ""
      if (allOption) {
        categorySelect.appendChild(allOption)
      } else {
        const newAllOption = document.createElement("option")
        newAllOption.value = "all"
        newAllOption.textContent = "All Categories"
        categorySelect.appendChild(newAllOption)
      }

      // Add categories from database
      categories.forEach((category) => {
        const option = document.createElement("option")
        option.value = category.id
        option.textContent = category.name
        categorySelect.appendChild(option)
      })
    }
  } catch (error) {
    console.error("Error loading categories:", error)
  }
}

// Filter lessons based on search and filter criteria
function filterLessons() {
  const searchInput = document.querySelector(".lessons-search input")
  const categorySelect = document.querySelector(".filter select[name='category']")
  const difficultySelect = document.querySelector(".filter select[name='difficulty']")
  const durationSelect = document.querySelector(".filter select[name='duration']")

  const searchTerm = searchInput ? searchInput.value.toLowerCase() : ""
  const category = categorySelect ? categorySelect.value : "all"
  const difficulty = difficultySelect ? difficultySelect.value : "all"
  const duration = durationSelect ? durationSelect.value : "all"

  const lessonCards = document.querySelectorAll(".lesson-card")

  lessonCards.forEach((card) => {
    const title = card.querySelector("h3").textContent.toLowerCase()
    const description = card.querySelector("p").textContent.toLowerCase()
    const cardCategory = card.dataset.categoryId
    const cardDifficulty = card.dataset.difficulty
    const cardDuration = Number.parseInt(card.dataset.duration)

    // Check if lesson matches search term
    const matchesSearch = searchTerm === "" || title.includes(searchTerm) || description.includes(searchTerm)

    // Check if lesson matches category filter
    const matchesCategory = category === "all" || cardCategory === category

    // Check if lesson matches difficulty filter
    const matchesDifficulty = difficulty === "all" || cardDifficulty === difficulty

    // Check if lesson matches duration filter
    let matchesDuration = true
    if (duration !== "all") {
      if (duration === "short" && cardDuration >= 10) matchesDuration = false
      if (duration === "medium" && (cardDuration < 10 || cardDuration > 20)) matchesDuration = false
      if (duration === "long" && cardDuration <= 20) matchesDuration = false
    }

    // Show or hide lesson card based on filters
    if (matchesSearch && matchesCategory && matchesDifficulty && matchesDuration) {
      card.style.display = "block"
    } else {
      card.style.display = "none"
    }
  })
}

// Load lessons from Supabase
async function loadLessons(childId) {
  try {
    const lessons = await getLessons()

    if (lessons.length === 0) {
      // No lessons found
      const lessonsGrid = document.querySelector(".lessons-grid")
      if (lessonsGrid) {
        lessonsGrid.innerHTML = `
          <div class="no-lessons-message">
            <h3>No lessons found</h3>
            <p>Check back later for new content!</p>
          </div>
        `
      }
      return
    }

    // Get lesson progress for this child if childId is provided
    const lessonProgress = {}
    if (childId) {
      const { data, error } = await supabase.from("lesson_progress").select("*").eq("child_id", childId)

      if (!error && data) {
        // Create a map of lesson_id to progress
        data.forEach((progress) => {
          lessonProgress[progress.lesson_id] = progress
        })
      }
    }

    // Update lessons grid with lessons data
    const lessonsGrid = document.querySelector(".lessons-grid")
    if (lessonsGrid) {
      lessonsGrid.innerHTML = ""

      lessons.forEach((lesson) => {
        // Get progress for this lesson
        const progress = lessonProgress[lesson.id] || { progress_percentage: 0, completed: false }

        // Create lesson card
        const lessonCard = document.createElement("div")
        lessonCard.className = "lesson-card"
        lessonCard.dataset.id = lesson.id
        lessonCard.dataset.categoryId = lesson.category_id
        lessonCard.dataset.difficulty = lesson.difficulty_level
        lessonCard.dataset.duration = lesson.duration

        // Determine difficulty level display
        let difficultyDots = ""
        let difficultyText = ""

        switch (lesson.difficulty_level) {
          case "beginner":
            difficultyDots = `
              <span class="difficulty-dot active"></span>
              <span class="difficulty-dot"></span>
              <span class="difficulty-dot"></span>
            `
            difficultyText = "Beginner"
            break
          case "intermediate":
            difficultyDots = `
              <span class="difficulty-dot active"></span>
              <span class="difficulty-dot active"></span>
              <span class="difficulty-dot"></span>
            `
            difficultyText = "Intermediate"
            break
          case "advanced":
            difficultyDots = `
              <span class="difficulty-dot active"></span>
              <span class="difficulty-dot active"></span>
              <span class="difficulty-dot active"></span>
            `
            difficultyText = "Advanced"
            break
        }

        // Get category name
        const categoryName = lesson.categories ? lesson.categories.name : "Uncategorized"

        // Create lesson card HTML
        lessonCard.innerHTML = `
          <div class="lesson-image">
            <img src="${lesson.thumbnail_url || `https://api.dicebear.com/6.x/shapes/svg?seed=lesson${lesson.id}`}" alt="Lesson Image">
            <div class="lesson-category">${categoryName}</div>
            <div class="lesson-duration">${lesson.duration} min</div>
            ${progress.completed ? '<div class="lesson-completed">Completed</div>' : ""}
          </div>
          <div class="lesson-content">
            <h3>${lesson.title}</h3>
            <p>${lesson.description}</p>
            ${
              progress.progress_percentage > 0 && !progress.completed
                ? `<div class="progress-bar">
                <div class="progress" style="width: ${progress.progress_percentage}%;"></div>
              </div>`
                : ""
            }
            <div class="lesson-meta">
              <div class="lesson-difficulty">
                ${difficultyDots}
                ${difficultyText}
              </div>
              <button class="btn btn-small">${progress.progress_percentage > 0 ? "Continue" : "Start"} Lesson</button>
            </div>
          </div>
        `

        // Add click event to start/continue button
        const startButton = lessonCard.querySelector(".btn")
        startButton.addEventListener("click", () => {
          // In a real app, this would navigate to the lesson page
          console.log(`Starting lesson: ${lesson.id}`)
          // window.location.href = `lesson-view.html?id=${lesson.id}`
        })

        // Add lesson card to grid
        lessonsGrid.appendChild(lessonCard)
      })
    }
  } catch (error) {
    console.error("Error loading lessons:", error)
  }
}
