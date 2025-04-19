// Main JavaScript Functions

document.addEventListener("DOMContentLoaded", () => {
  // Initialize testimonial slider
  initTestimonialSlider()

  // Add animations to elements when they come into view
  initScrollAnimations()
})

// Testimonial Slider
function initTestimonialSlider() {
  const testimonials = document.querySelectorAll(".testimonial-card")
  const dots = document.querySelectorAll(".dot")
  let currentIndex = 0

  // Set initial active testimonial
  setActiveTestimonial(currentIndex)

  // Add click event to dots
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      setActiveTestimonial(index)
    })
  })

  // Auto slide every 5 seconds
  setInterval(() => {
    currentIndex = (currentIndex + 1) % testimonials.length
    setActiveTestimonial(currentIndex)
  }, 5000)

  function setActiveTestimonial(index) {
    // Remove active class from all testimonials and dots
    testimonials.forEach((testimonial) => testimonial.classList.remove("active"))
    dots.forEach((dot) => dot.classList.remove("active"))

    // Add active class to current testimonial and dot
    testimonials[index].classList.add("active")
    dots[index].classList.add("active")

    currentIndex = index
  }
}

// Scroll Animations
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll(".feature-card, .benefit")

  // Add animation class when element is in viewport
  function checkScroll() {
    animatedElements.forEach((element) => {
      const elementTop = element.getBoundingClientRect().top
      const elementVisible = 150

      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add("slide-up")
      }
    })
  }

  // Check elements on scroll
  window.addEventListener("scroll", checkScroll)

  // Check elements on load
  checkScroll()
}
