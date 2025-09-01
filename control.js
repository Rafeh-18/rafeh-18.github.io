// Handle navigation between sections
    document.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", function(e) {
        e.preventDefault();
        
        // Update active link
        document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
        this.classList.add("active");
        
        // Show the target section
        const targetId = this.getAttribute("data-page");
        document.querySelectorAll(".page-section").forEach(section => {
          section.classList.remove("active");
        });
        document.getElementById(targetId).classList.add("active");
        
        // Scroll to top of page
        window.scrollTo(0, 0);
      });
    });

    // Handle initial page load with hash in URL
    window.addEventListener('load', function() {
      if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const targetLink = document.querySelector(`.nav-link[data-page="${targetId}"]`);
        if (targetLink) {
          targetLink.click();
        }
      }
    });

    // Handle browser back/forward navigation
    window.addEventListener('hashchange', function() {
      if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const targetLink = document.querySelector(`.nav-link[data-page="${targetId}"]`);
        if (targetLink) {
          targetLink.click();
        }
      }
    });


  const form = document.getElementById("contact-form");
  const successMsg = document.getElementById("form-success");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(form);

    const response = await fetch("https://formspree.io/f/mblakabe", {
      method: "POST",
      body: data,
      headers: {
        Accept: "application/json"
      }
    });

    if (response.ok) {
      form.reset();
      successMsg.style.display = "block";
    } else {
      alert("Oops! Something went wrong. Please try again.");
    }
  });
