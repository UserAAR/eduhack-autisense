// Supabase Integration

// Initialize Supabase client
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
import { createClient } from "@supabase/supabase-js"
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ==================== Authentication Functions ====================

// Check if user is authenticated
async function checkUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    console.error("Error checking user:", error.message)
    return null
  }
}

// Register a new parent
async function registerParent(email, password, fullName, phone = null, address = null) {
  try {
    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: "parent",
        },
      },
    })

    if (authError) throw authError

    // Create parent record
    if (authData.user) {
      const { error: parentError } = await supabase.from("parents").insert({
        id: authData.user.id,
        phone,
        address,
      })

      if (parentError) throw parentError
    }

    return authData
  } catch (error) {
    console.error("Error registering parent:", error.message)
    throw error
  }
}

// Register a new teacher
async function registerTeacher(
  email,
  password,
  fullName,
  specialization,
  experience,
  bio = null,
  qualifications = [],
  availability = null,
  hourlyRate = null,
) {
  try {
    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: "teacher",
        },
      },
    })

    if (authError) throw authError

    // Create teacher record
    if (authData.user) {
      const { error: teacherError } = await supabase.from("teachers").insert({
        id: authData.user.id,
        specialization,
        experience,
        bio,
        qualifications,
        availability,
        hourly_rate: hourlyRate,
      })

      if (teacherError) throw teacherError
    }

    return authData
  } catch (error) {
    console.error("Error registering teacher:", error.message)
    throw error
  }
}

// Sign in user
async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error signing in:", error.message)
    throw error
  }
}

// Sign out user
async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    console.error("Error signing out:", error.message)
    throw error
  }
}

// Get user profile (parent or teacher)
async function getUserProfile() {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError) throw userError

    if (!user) return null

    // Get user data from users table
    const { data: userData, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (profileError) throw profileError

    // Get role-specific data
    if (userData.role === "parent") {
      const { data: parentData, error: parentError } = await supabase
        .from("parents")
        .select("*")
        .eq("id", user.id)
        .single()

      if (parentError) throw parentError
      return { ...userData, ...parentData }
    } else if (userData.role === "teacher") {
      const { data: teacherData, error: teacherError } = await supabase
        .from("teachers")
        .select("*")
        .eq("id", user.id)
        .single()

      if (teacherError) throw teacherError
      return { ...userData, ...teacherData }
    }

    return userData
  } catch (error) {
    console.error("Error getting user profile:", error.message)
    return null
  }
}

// ==================== Children Functions ====================

// Add a child
async function addChild(parentId, name, age, avatarUrl = null, preferences = {}) {
  try {
    const { data, error } = await supabase
      .from("children")
      .insert({
        parent_id: parentId,
        name,
        age,
        avatar_url: avatarUrl,
        preferences,
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error adding child:", error.message)
    throw error
  }
}

// Get children for a parent
async function getChildren(parentId) {
  try {
    const { data, error } = await supabase
      .from("children")
      .select("*")
      .eq("parent_id", parentId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching children:", error.message)
    return []
  }
}

// Update child information
async function updateChild(childId, updates) {
  try {
    const { data, error } = await supabase.from("children").update(updates).eq("id", childId).select().single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error updating child:", error.message)
    throw error
  }
}

// Delete a child
async function deleteChild(childId) {
  try {
    const { error } = await supabase.from("children").delete().eq("id", childId)

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error deleting child:", error.message)
    throw error
  }
}

// ==================== Lessons Functions ====================

// Get all lessons
async function getLessons(filters = {}) {
  try {
    let query = supabase.from("lessons").select(`
        *,
        categories(name, icon_url)
      `)

    // Apply filters
    if (filters.categoryId) {
      query = query.eq("category_id", filters.categoryId)
    }

    if (filters.difficultyLevel) {
      query = query.eq("difficulty_level", filters.difficultyLevel)
    }

    if (filters.duration) {
      if (filters.duration === "short") {
        query = query.lt("duration", 10)
      } else if (filters.duration === "medium") {
        query = query.gte("duration", 10).lte("duration", 20)
      } else if (filters.duration === "long") {
        query = query.gt("duration", 20)
      }
    }

    // Order by
    query = query.order("created_at", { ascending: false })

    const { data, error } = await query

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching lessons:", error.message)
    return []
  }
}

// Get a specific lesson
async function getLesson(lessonId) {
  try {
    const { data, error } = await supabase
      .from("lessons")
      .select(`
        *,
        categories(name, icon_url)
      `)
      .eq("id", lessonId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching lesson:", error.message)
    return null
  }
}

// Track lesson progress
async function updateLessonProgress(
  childId,
  lessonId,
  progressPercentage,
  completed = false,
  timeSpent = 0,
  notes = null,
) {
  try {
    // Check if a record already exists
    const { data: existingData, error: existingError } = await supabase
      .from("lesson_progress")
      .select("*")
      .eq("child_id", childId)
      .eq("lesson_id", lessonId)
      .single()

    if (existingError && existingError.code !== "PGRST116") {
      // PGRST116 is the error code for "no rows returned"
      throw existingError
    }

    let data
    if (existingData) {
      // Update existing record
      const { data: updatedData, error: updateError } = await supabase
        .from("lesson_progress")
        .update({
          progress_percentage: progressPercentage,
          completed,
          last_accessed: new Date().toISOString(),
          time_spent: existingData.time_spent + timeSpent,
          notes: notes || existingData.notes,
        })
        .eq("id", existingData.id)
        .select()
        .single()

      if (updateError) throw updateError
      data = updatedData
    } else {
      // Create new record
      const { data: newData, error: insertError } = await supabase
        .from("lesson_progress")
        .insert({
          child_id: childId,
          lesson_id: lessonId,
          progress_percentage: progressPercentage,
          completed,
          time_spent: timeSpent,
          notes,
        })
        .select()
        .single()

      if (insertError) throw insertError
      data = newData
    }

    return data
  } catch (error) {
    console.error("Error updating lesson progress:", error.message)
    throw error
  }
}

// Get lesson progress for a child
async function getChildLessonProgress(childId) {
  try {
    const { data, error } = await supabase
      .from("lesson_progress")
      .select(`
        *,
        lessons(id, title, description, thumbnail_url, category_id, difficulty_level, duration)
      `)
      .eq("child_id", childId)
      .order("last_accessed", { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching child lesson progress:", error.message)
    return []
  }
}

// ==================== Games Functions ====================

// Get all games
async function getGames(filters = {}) {
  try {
    let query = supabase.from("games").select(`
        *,
        categories(name, icon_url)
      `)

    // Apply filters
    if (filters.categoryId) {
      query = query.eq("category_id", filters.categoryId)
    }

    if (filters.difficultyLevel) {
      query = query.eq("difficulty_level", filters.difficultyLevel)
    }

    // Order by
    query = query.order("created_at", { ascending: false })

    const { data, error } = await query

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching games:", error.message)
    return []
  }
}

// Get a specific game
async function getGame(gameId) {
  try {
    const { data, error } = await supabase
      .from("games")
      .select(`
        *,
        categories(name, icon_url)
      `)
      .eq("id", gameId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching game:", error.message)
    return null
  }
}

// Update game progress
async function updateGameProgress(
  childId,
  gameId,
  score,
  highestLevel = 1,
  timesPlayed = 1,
  timeSpent = 0,
  achievements = [],
) {
  try {
    // Check if a record already exists
    const { data: existingData, error: existingError } = await supabase
      .from("game_progress")
      .select("*")
      .eq("child_id", childId)
      .eq("game_id", gameId)
      .single()

    if (existingError && existingError.code !== "PGRST116") {
      throw existingError
    }

    let data
    if (existingData) {
      // Update existing record
      const { data: updatedData, error: updateError } = await supabase
        .from("game_progress")
        .update({
          score: Math.max(existingData.score, score),
          highest_level: Math.max(existingData.highest_level, highestLevel),
          times_played: existingData.times_played + timesPlayed,
          last_played: new Date().toISOString(),
          time_spent: existingData.time_spent + timeSpent,
          achievements: [...new Set([...existingData.achievements, ...achievements])],
        })
        .eq("id", existingData.id)
        .select()
        .single()

      if (updateError) throw updateError
      data = updatedData
    } else {
      // Create new record
      const { data: newData, error: insertError } = await supabase
        .from("game_progress")
        .insert({
          child_id: childId,
          game_id: gameId,
          score,
          highest_level: highestLevel,
          times_played: timesPlayed,
          time_spent: timeSpent,
          achievements,
        })
        .select()
        .single()

      if (insertError) throw insertError
      data = newData
    }

    return data
  } catch (error) {
    console.error("Error updating game progress:", error.message)
    throw error
  }
}

// Get game progress for a child
async function getChildGameProgress(childId) {
  try {
    const { data, error } = await supabase
      .from("game_progress")
      .select(`
        *,
        games(id, title, description, thumbnail_url, category_id, difficulty_level, estimated_time)
      `)
      .eq("child_id", childId)
      .order("last_played", { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching child game progress:", error.message)
    return []
  }
}

// ==================== Test Results Functions ====================

// Save test result
async function saveTestResult(
  childId,
  score,
  maxScore,
  lessonId = null,
  gameId = null,
  answers = null,
  feedback = null,
) {
  try {
    const { data, error } = await supabase
      .from("test_results")
      .insert({
        child_id: childId,
        lesson_id: lessonId,
        game_id: gameId,
        score,
        max_score: maxScore,
        answers,
        feedback,
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error saving test result:", error.message)
    throw error
  }
}

// Get test results for a child
async function getChildTestResults(childId) {
  try {
    const { data, error } = await supabase
      .from("test_results")
      .select(`
        *,
        lessons(title),
        games(title)
      `)
      .eq("child_id", childId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching child test results:", error.message)
    return []
  }
}

// ==================== Teachers Functions ====================

// Get all teachers
async function getTeachers(filters = {}) {
  try {
    let query = supabase.from("teachers").select(`
        *,
        users(full_name, email)
      `)

    // Apply filters
    if (filters.specialization) {
      query = query.eq("specialization", filters.specialization)
    }

    if (filters.minExperience) {
      query = query.gte("experience", filters.minExperience)
    }

    if (filters.verified) {
      query = query.eq("is_verified", true)
    }

    // Order by
    query = query.order("experience", { ascending: false })

    const { data, error } = await query

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching teachers:", error.message)
    return []
  }
}

// Get a specific teacher
async function getTeacher(teacherId) {
  try {
    const { data, error } = await supabase
      .from("teachers")
      .select(`
        *,
        users(full_name, email)
      `)
      .eq("id", teacherId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching teacher:", error.message)
    return null
  }
}

// Connect child with teacher
async function connectChildWithTeacher(childId, teacherId, notes = null) {
  try {
    const { data, error } = await supabase
      .from("teacher_child")
      .insert({
        teacher_id: teacherId,
        child_id: childId,
        status: "pending",
        notes,
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error connecting child with teacher:", error.message)
    throw error
  }
}

// Update teacher-child connection status
async function updateTeacherChildStatus(connectionId, status, notes = null) {
  try {
    const { data, error } = await supabase
      .from("teacher_child")
      .update({
        status,
        notes: notes !== null ? notes : undefined,
      })
      .eq("id", connectionId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error updating teacher-child status:", error.message)
    throw error
  }
}

// Get children for a teacher
async function getTeacherChildren(teacherId) {
  try {
    const { data, error } = await supabase
      .from("teacher_child")
      .select(`
        *,
        children(id, name, age, avatar_url, parent_id),
        children.parents:parent_id(id, users(full_name, email))
      `)
      .eq("teacher_id", teacherId)
      .eq("status", "active")

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching teacher's children:", error.message)
    return []
  }
}

// Get teachers for a child
async function getChildTeachers(childId) {
  try {
    const { data, error } = await supabase
      .from("teacher_child")
      .select(`
        *,
        teachers(id, specialization, experience, profile_image_url),
        teachers.users:id(full_name, email)
      `)
      .eq("child_id", childId)
      .eq("status", "active")

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching child's teachers:", error.message)
    return []
  }
}

// ==================== AI Insights Functions ====================

// Save AI insight
async function saveAIInsight(childId, insightType, content, data = null) {
  try {
    const { data: insightData, error } = await supabase
      .from("ai_insights")
      .insert({
        child_id: childId,
        insight_type: insightType,
        content,
        data,
      })
      .select()
      .single()

    if (error) throw error
    return insightData
  } catch (error) {
    console.error("Error saving AI insight:", error.message)
    throw error
  }
}

// Get AI insights for a child
async function getChildAIInsights(childId) {
  try {
    const { data, error } = await supabase
      .from("ai_insights")
      .select("*")
      .eq("child_id", childId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching child AI insights:", error.message)
    return []
  }
}

// ==================== Notifications Functions ====================

// Create notification
async function createNotification(userId, title, message, notificationType, relatedId = null) {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        title,
        message,
        notification_type: notificationType,
        related_id: relatedId,
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error creating notification:", error.message)
    throw error
  }
}

// Get notifications for a user
async function getUserNotifications(userId) {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching user notifications:", error.message)
    return []
  }
}

// Mark notification as read
async function markNotificationAsRead(notificationId) {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error marking notification as read:", error.message)
    throw error
  }
}

// ==================== Categories Functions ====================

// Get all categories
async function getCategories() {
  try {
    const { data, error } = await supabase.from("categories").select("*").order("name", { ascending: true })

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching categories:", error.message)
    return []
  }
}

// Export all functions
export {
  // Authentication
  checkUser,
  registerParent,
  registerTeacher,
  signIn,
  signOut,
  getUserProfile,
  // Children
  addChild,
  getChildren,
  updateChild,
  deleteChild,
  // Lessons
  getLessons,
  getLesson,
  updateLessonProgress,
  getChildLessonProgress,
  // Games
  getGames,
  getGame,
  updateGameProgress,
  getChildGameProgress,
  // Test Results
  saveTestResult,
  getChildTestResults,
  // Teachers
  getTeachers,
  getTeacher,
  connectChildWithTeacher,
  updateTeacherChildStatus,
  getTeacherChildren,
  getChildTeachers,
  // AI Insights
  saveAIInsight,
  getChildAIInsights,
  // Notifications
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  // Categories
  getCategories,
}
