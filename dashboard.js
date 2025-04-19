// Dashboard JavaScript

// Import the necessary functions from supabase.js
import {
  getChildLessonProgress,
  getChildGameProgress,
  getChildAIInsights,
  getChildTestResults,
  getChildTeachers,
} from "./supabase.js"

import { Chart } from "@/components/ui/chart"
// Dashboard JavaScript

// import { checkUser, signOut } from "./auth.js"

document.addEventListener("DOMContentLoaded", () => {
  // Initialize sidebar toggle functionality
  initSidebar()

  // Initialize child switcher
  initChildSwitcher()

  // Initialize charts
  initCharts()

  // Check user authentication
  checkUserAuthentication()
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
    \
    if (window.innerWidth &lt;
    = 992)
    if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
      sidebar.classList.remove("active")
    }
  })
}

// Child Switcher Functionality
function initChildSwitcher() {
  const childOptions = document.querySelectorAll(".child-option")
  const currentChildName = document.getElementById("current-child-name")
  const welcomeChildName = document.getElementById("welcome-child-name")

  childOptions.forEach((option) => {
    option.addEventListener("click", function () {
      // Remove active class from all options
      childOptions.forEach((opt) => opt.classList.remove("active"))

      // Add active class to clicked option
      this.classList.add("active")

      // Update child name
      const childName = this.querySelector("span").textContent
      if (currentChildName) currentChildName.textContent = `${childName}'s Journey`
      if (welcomeChildName) welcomeChildName.textContent = childName

      // Load data for the selected child
      loadChildData(this.dataset.childId)
    })
  })
}

// Load Child Data from Supabase
async function loadChildData(childId) {
  try {
    // Show loading state
    showLoadingState()

    // Fetch child data from Supabase
    const [lessonProgress, gameProgress, aiInsights, testResults, teachers] = await Promise.all([
      getChildLessonProgress(childId),
      getChildGameProgress(childId),
      getChildAIInsights(childId),
      getChildTestResults(childId),
      getChildTeachers(childId),
    ])

    // Update dashboard with fetched data
    updateDashboardStats(lessonProgress, gameProgress, testResults)
    updateProgressChart(lessonProgress)
    updateEngagementChart(gameProgress)
    updateRecentLessons(lessonProgress)
    updateFavoriteGames(gameProgress)
    updateAIInsights(aiInsights)
    updateRecommendedTeachers(teachers)

    // Hide loading state
    hideLoadingState()
  } catch (error) {
    console.error("Error loading child data:", error)
    hideLoadingState()
    showErrorMessage("Failed to load data. Please try again.")
  }
}

// Show loading state
function showLoadingState() {
  // Add loading indicators to dashboard sections
  document.querySelectorAll(".stat-card, .chart-container, .grid-item").forEach((element) => {
    element.classList.add("loading")
  })
}

// Hide loading state
function hideLoadingState() {
  // Remove loading indicators
  document.querySelectorAll(".loading").forEach((element) => {
    element.classList.remove("loading")
  })
}

// Show error message
function showErrorMessage(message) {
  // Create error toast or notification
  const errorToast = document.createElement("div")
  errorToast.className = "error-toast"
  errorToast.textContent = message
  document.body.appendChild(errorToast)

  // Remove after 3 seconds
  setTimeout(() => {
    errorToast.remove()
  }, 3000)
}

// Update dashboard stats
function updateDashboardStats(lessonProgress, gameProgress, testResults) {
  // Calculate stats
  const completedLessons = lessonProgress.filter((item) => item.completed).length
  const playedGames = gameProgress.length
  const achievements = gameProgress.reduce((total, game) => total + game.achievements.length, 0)
  const totalPoints = testResults.reduce((total, test) => total + test.score, 0)

  // Update DOM
  document.querySelector(".stat-card:nth-child(1) .stat-value").textContent = completedLessons
  document.querySelector(".stat-card:nth-child(2) .stat-value").textContent = playedGames
  document.querySelector(".stat-card:nth-child(3) .stat-value").textContent = achievements
  document.querySelector(".stat-card:nth-child(4) .stat-value").textContent = totalPoints
}

// Charts Functionality
function initCharts() {
  // Initialize Progress Chart
  initProgressChart()

  // Initialize Engagement Chart
  initEngagementChart()

  // Add event listeners to chart period buttons
  document.querySelectorAll(".chart-action").forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active class from all buttons in the same chart
      const container = this.closest(".chart-actions")
      container.querySelectorAll(".chart-action").forEach((btn) => btn.classList.remove("active"))

      // Add active class to clicked button
      this.classList.add("active")

      // Update chart based on selected period
      const chartContainer = this.closest(".chart-container")
      const chartCanvas = chartContainer.querySelector("canvas")
      const period = this.dataset.period

      if (chartCanvas.id === "progressChart") {
        updateProgressChart(null, period)
      } else if (chartCanvas.id === "engagementChart") {
        updateEngagementChart(null, period)
      }
    })
  })
}

// Progress Chart
let progressChart
function initProgressChart() {
  const ctx = document.getElementById("progressChart")
  if (!ctx) return

  progressChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Lessons",
          data: [0, 0, 0, 0, 0, 0, 0],
          borderColor: "#6A5ACD",
          backgroundColor: "rgba(106, 90, 205, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Games",
          data: [0, 0, 0, 0, 0, 0, 0],
          borderColor: "#FF9AA2",
          backgroundColor: "rgba(255, 154, 162, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
    },
  })
}

function updateProgressChart(lessonProgress = null, period = "week") {
  if (!progressChart) return

  let labels, lessonData, gameData

  if (lessonProgress) {
    // Process real data
    // This would process the actual data from Supabase
    // For now, we'll use placeholder data
  }

  switch (period) {
    case "week":
      labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      lessonData = [2, 1, 3, 0, 2, 1, 3]
      gameData = [1, 2, 0, 3, 1, 2, 1]
      break
    case "month":
      labels = ["Week 1", "Week 2", "Week 3", "Week 4"]
      lessonData = [10, 8, 12, 9]
      gameData = [8, 10, 7, 11]
      break
    case "year":
      labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      lessonData = [20, 18, 25, 30, 28, 35, 40, 42, 38, 30, 32, 36]
      gameData = [15, 20, 18, 25, 22, 30, 28, 35, 30, 25, 28, 30]
      break
  }

  progressChart.data.labels = labels
  progressChart.data.datasets[0].data = lessonData
  progressChart.data.datasets[1].data = gameData
  progressChart.update()
}

// Engagement Chart
let engagementChart
function initEngagementChart() {
  const ctx = document.getElementById("engagementChart")
  if (!ctx) return

  engagementChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Minutes Spent",
          data: [0, 0, 0, 0, 0, 0, 0],
          backgroundColor: [
            "rgba(106, 90, 205, 0.6)",
            "rgba(255, 154, 162, 0.6)",
            "rgba(255, 179, 71, 0.6)",
            "rgba(255, 218, 193, 0.6)",
            "rgba(106, 90, 205, 0.6)",
            "rgba(255, 154, 162, 0.6)",
            "rgba(255, 179, 71, 0.6)",
          ],
          borderColor: [
            "rgba(106, 90, 205, 1)",
            "rgba(255, 154, 162, 1)",
            "rgba(255, 179, 71, 1)",
            "rgba(255, 218, 193, 1)",
            "rgba(106, 90, 205, 1)",
            "rgba(255, 154, 162, 1)",
            "rgba(255, 179, 71, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Minutes",
          },
        },
      },
    },
  })
}

function updateEngagementChart(gameProgress = null, period = "week") {
  if (!engagementChart) return

  let labels, data

  if (gameProgress) {
    // Process real data
    // This would process the actual data from Supabase
    // For now, we'll use placeholder data
  }

  switch (period) {
    case "week":
      labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      data = [25, 30, 45, 20, 35, 55, 40]
      break
    case "month":
      labels = ["Week 1", "Week 2", "Week 3", "Week 4"]
      data = [180, 210, 250, 190]
      break
    case "year":
      labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      data = [800, 750, 900, 950, 1000, 1100, 1200, 1150, 1050, 950, 900, 1000]
      break
  }

  engagementChart.data.labels = labels
  engagementChart.data.datasets[0].data = data

  // Generate colors based on the number of labels
  const colors = generateColors(labels.length)
  engagementChart.data.datasets[0].backgroundColor = colors.backgroundColor
  engagementChart.data.datasets[0].borderColor = colors.borderColor

  engagementChart.update()
}

// Generate colors for chart
function generateColors(count) {
  const baseColors = [
    [106, 90, 205], // Primary
    [255, 154, 162], // Secondary
    [255, 179, 71], // Accent
    [255, 218, 193], // Tertiary
  ]

  const backgroundColor = []
  const borderColor = []

  for (let i = 0; i &lt; count;
  i++
  )
  {
    const color = baseColors[i % baseColors.length]
    backgroundColor.push(`rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.6)`)
    borderColor.push(`rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`)
  }

  return { backgroundColor, borderColor }
}

// Update recent lessons
function updateRecentLessons(lessonProgress) {
  const recentLessonsContainer = document.querySelector('.recent-lessons .grid-content');



Now, let's create a new file for handling the lessons page:

```js file="lessons.js"
// Lessons JavaScript

import { checkUser, getChildren, getLessons } from "./supabase.js"

document.addEventListener("DOMContentLoaded", () => {
  // Initialize sidebar toggle functionality
  initSidebar()

  // Initialize child switcher
  initChildSwitcher()

  // Check user authentication
  checkUserAuthentication()

  // Initialize lesson filters
  initLessonFilters()

  // Load lessons
  loadLessons()
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
    if (window.innerWidth &lt;= 992) 
      if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
        sidebar.classList.remove("active")
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
      // This would be implemented in a real app
      console.log("No children found for this parent")
      return
    }

    // Update child switcher with children data
    const childSwitcher = document.querySelector(".child-switcher")
    const childDropdown = childSwitcher.querySelector(".child-dropdown")
    
    // Clear existing options except the "Add Child" option
    const addChildOption = childDropdown.querySelector(".add-child")
    childDropdown.innerHTML = ""
    childDropdown.appendChild(addChildOption)
    
    // Add children to dropdown
    children.forEach((child, index) => {
      const childOption = document.createElement("div")
      childOption.className = index === 0 ? "child-option active" : "child-option"
      childOption.dataset.childId = child.id
      
      childOption.innerHTML = `
        <img src="${child.avatar_url || `https://api.dicebear.com/6.x/avataaars-neutral/svg?seed=child${index + 1}`}" alt="Child Avatar">
        <span>${child.name}</span>
      `
      
      childDropdown.insertBefore(childOption, addChildOption)
      
      // Add click event
      childOption.addEventListener("click", function() {
        // Remove active class from all options
        childDropdown.querySelectorAll(".child-option").forEach(opt => opt.classList.remove("active"))
        
        // Add active class to clicked option
        this.classList.add("active")
        
        // Update selected child display
        const selectedChild = childSwitcher.querySelector(".selected-child")
        selectedChild.querySelector("img").src = this.querySelector("img").src
        selectedChild.querySelector("span").textContent = `${this.querySelector("span").textContent}'s Journey`
        
        // Load lessons for this child
        loadLessons(this.dataset.childId)
      })
    })
    
    // Update selected child display with first child
    const firstChild = children[0]
    const selectedChild = childSwitcher.querySelector(".selected-child")
    selectedChild.querySelector("img").src = firstChild.avatar_url || `https://api.dicebear.com/6.x/avataaars-neutral/svg?seed=child1`
    selectedChild.querySelector("span").textContent = `${firstChild.name}'s Journey`
    
    // Load lessons for first child
    loadLessons(firstChild.id)
  } catch (error) {
    console.error("Error loading children:", error)
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
  
  lessonCards.forEach(card => {
    const title = card.querySelector("h3").textContent.toLowerCase()
    const description = card.querySelector("p").textContent.toLowerCase()
    const cardCategory = card.querySelector(".lesson-category").textContent.toLowerCase()
    const cardDifficulty = card.querySelector(".lesson-difficulty").textContent.toLowerCase()
    const cardDuration = Number.parseInt(card.querySelector(".lesson-duration").textContent)
    
    // Check if lesson matches search term
    const matchesSearch = searchTerm === "" || 
                          title.includes(searchTerm) || 
                          description.includes(searchTerm)
    
    // Check if lesson matches category filter
    const matchesCategory = category === "all" || 
                           cardCategory.includes(category.toLowerCase())
    
    // Check if lesson matches difficulty filter
    const matchesDifficulty = difficulty === "all" || 
                             cardDifficulty.includes(difficulty.toLowerCase())
    
    // Check if lesson matches duration filter
    let matchesDuration = true
    if (duration !== "all") {
      if (duration === "short" && cardDuration >= 10) matchesDuration = false
      if (duration === "medium" && (cardDuration &lt; 10 || cardDuration > 20)) matchesDuration = false
      if (duration === "long" && cardDuration &lt;= 20) matchesDuration = false
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
      console.log("No lessons found")
      return
    }
    
    // Get lesson progress for this child if childId is provided
    const lessonProgress = {}
    if (childId) {
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("*")
        .eq("child_id", childId)
      
      if (!error && data) {
        // Create a map of lesson_id to progress
        data.forEach(progress => {
          lessonProgress[progress.lesson_id] = progress
        })
      }
    }
    
    // Update lessons grid with lessons data
    const lessonsGrid = document.querySelector(".lessons-grid")
    lessonsGrid.innerHTML = ""
    
    lessons.forEach(lesson => {
      // Get progress for this lesson
      const progress = lessonProgress[lesson.id] || { progress_percentage: 0, completed: false }
      
      // Create lesson card
      const lessonCard = document.createElement("div")
      lessonCard.className = "lesson-card"
      lessonCard.dataset.id = lesson.id
      
      // Determine difficulty level display
      let difficultyDots = ""
      let difficultyText = ""
      
      switch(lesson.difficulty_level) {
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
      
      // Create lesson card HTML
      lessonCard.innerHTML = `
        <div class="lesson-image">
          <img src="${lesson.thumbnail_url || `https://api.dicebear.com/6.x/shapes/svg?seed=lesson${lesson.id}`}" alt="Lesson Image">
          <div class="lesson-category">${lesson.category}</div>
          <div class="lesson-duration">${lesson.duration} min</div>
          ${progress.completed ? '<div class="lesson-completed">Completed</div>' : ''}
        </div>
        <div class="lesson-content">
          <h3>${lesson.title}</h3>
          <p>${lesson.description}</p>
          ${progress.progress_percentage > 0 && !progress.completed ? 
            `<div class="progress-bar">
              <div class="progress" style="width: ${progress.progress_percentage}%;"></div>
            </div>` : ''}
          <div class="lesson-meta">
            <div class="lesson-difficulty">
              ${difficultyDots}
              ${difficultyText}
            </div>
            <button class="btn btn-small">${progress.progress_percentage > 0 ? 'Continue' : 'Start'} Lesson</button>
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
  } catch (error) {
    console.error("Error loading lessons:", error)
  }
}
