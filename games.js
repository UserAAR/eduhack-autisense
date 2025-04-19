// Games JavaScript

import { checkUser, getChildren, getGames, getCategories } from "./supabase.js"
import { supabase } from "./supabase.js"

document.addEventListener("DOMContentLoaded", () => {
  // Initialize sidebar toggle functionality
  initSidebar()

  // Initialize child switcher
  initChildSwitcher()

  // Check user authentication
  checkUserAuthentication()

  // Initialize game filters
  initGameFilters()

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

      // Load games for the selected child
      loadGames(this.dataset.childId)
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

        // Load games for this child
        loadGames(this.dataset.childId)
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

    // Load games for first child
    loadGames(firstChild.id)
  } catch (error) {
    console.error("Error loading children:", error)
  }
}

// Show add child prompt
function showAddChildPrompt() {
  const gamesContainer = document.querySelector(".games-container")
  if (gamesContainer) {
    gamesContainer.innerHTML = `
      <div class="no-children-message">
        <h2>No children found</h2>
        <p>You need to add a child to your account before you can access games.</p>
        <button class="btn btn-primary add-child-btn">Add Child</button>
      </div>
    `

    // Add event listener to the button
    const addChildBtn = gamesContainer.querySelector(".add-child-btn")
    if (addChildBtn) {
      addChildBtn.addEventListener("click", () => {
        // In a real app, this would open a modal or navigate to an add child page
        console.log("Add child button clicked")
        // window.location.href = "add-child.html"
      })
    }
  }
}

// Initialize game filters
function initGameFilters() {
  const searchInput = document.querySelector(".games-search input")
  const categorySelect = document.querySelector(".filter select[name='category']")
  const difficultySelect = document.querySelector(".filter select[name='difficulty']")

  // Add event listeners to filters
  if (searchInput) {
    searchInput.addEventListener("input", filterGames)
  }

  if (categorySelect) {
    categorySelect.addEventListener("change", filterGames)
  }

  if (difficultySelect) {
    difficultySelect.addEventListener("change", filterGames)
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

// Filter games based on search and filter criteria
function filterGames() {
  const searchInput = document.querySelector(".games-search input")
  const categorySelect = document.querySelector(".filter select[name='category']")
  const difficultySelect = document.querySelector(".filter select[name='difficulty']")

  const searchTerm = searchInput ? searchInput.value.toLowerCase() : ""
  const category = categorySelect ? categorySelect.value : "all"
  const difficulty = difficultySelect ? difficultySelect.value : "all"

  const gameCards = document.querySelectorAll(".game-card")

  gameCards.forEach((card) => {
    const title = card.querySelector("h3").textContent.toLowerCase()
    const description = card.querySelector("p").textContent.toLowerCase()
    const cardCategory = card.dataset.categoryId
    const cardDifficulty = card.dataset.difficulty

    // Check if game matches search term
    const matchesSearch = searchTerm === "" || title.includes(searchTerm) || description.includes(searchTerm)

    // Check if game matches category filter
    const matchesCategory = category === "all" || cardCategory === category

    // Check if game matches difficulty filter
    const matchesDifficulty = difficulty === "all" || cardDifficulty === difficulty

    // Show or hide game card based on filters
    if (matchesSearch && matchesCategory && matchesDifficulty) {
      card.style.display = "block"
    } else {
      card.style.display = "none"
    }
  })
}

// Load games from Supabase
async function loadGames(childId) {
  try {
    const games = await getGames()

    if (games.length === 0) {
      // No games found
      const gamesGrid = document.querySelector(".games-grid")
      if (gamesGrid) {
        gamesGrid.innerHTML = `
          <div class="no-games-message">
            <h3>No games found</h3>
            <p>Check back later for new content!</p>
          </div>
        `
      }
      return
    }

    // Get game progress for this child if childId is provided
    const gameProgress = {}
    if (childId) {
      const { data, error } = await supabase.from("game_progress").select("*").eq("child_id", childId)

      if (!error && data) {
        // Create a map of game_id to progress
        data.forEach((progress) => {
          gameProgress[progress.game_id] = progress
        })
      }
    }

    // Update games grid with games data
    const gamesGrid = document.querySelector(".games-grid")
    if (gamesGrid) {
      gamesGrid.innerHTML = ""

      games.forEach((game) => {
        // Get progress for this game
        const progress = gameProgress[game.id] || { score: 0, highest_level: 1, times_played: 0 }

        // Create game card
        const gameCard = document.createElement("div")
        gameCard.className = "game-card"
        gameCard.dataset.id = game.id
        gameCard.dataset.categoryId = game.category_id
        gameCard.dataset.difficulty = game.difficulty_level

        // Determine difficulty level display
        let difficultyDots = ""
        let difficultyText = ""

        switch (game.difficulty_level) {
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
        const categoryName = game.categories ? game.categories.name : "Uncategorized"

        // Create game card HTML
        gameCard.innerHTML = `
          <div class="game-image">
            <img src="${game.thumbnail_url || `https://api.dicebear.com/6.x/shapes/svg?seed=game${game.id}`}" alt="Game Image">
            <div class="game-category">${categoryName}</div>
            <div class="game-duration">${game.estimated_time} min</div>
            ${progress.times_played > 0 ? `<div class="game-played">Played ${progress.times_played} times</div>` : ""}
          </div>
          <div class="game-content">
            <h3>${game.title}</h3>
            <p>${game.description}</p>
            ${
              progress.score > 0
                ? `<div class="game-score">
                <span>Best Score: ${progress.score}</span>
                <span>Level: ${progress.highest_level}</span>
              </div>`
                : ""
            }
            <div class="game-meta">
              <div class="game-difficulty">
                ${difficultyDots}
                ${difficultyText}
              </div>
              <button class="btn btn-small">${progress.times_played > 0 ? "Play Again" : "Play Game"}</button>
            </div>
          </div>
        `

        // Add click event to play button
        const playButton = gameCard.querySelector(".btn")
        playButton.addEventListener("click", () => {
          // In a real app, this would navigate to the game page
          console.log(`Starting game: ${game.id}`)
          // window.location.href = `game-view.html?id=${game.id}`
        })

        // Add game card to grid
        gamesGrid.appendChild(gameCard)
      })
    }
  } catch (error) {
    console.error("Error loading games:", error)
  }
}
