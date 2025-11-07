document.getElementById("imageInput").addEventListener("change", function (e) {
  const fileText = document.getElementById("fileText");
  if (e.target.files.length > 0) {
    fileText.textContent = e.target.files[0].name;
  } else {
    fileText.textContent = "Click to upload image";
  }
});

// Form submission loading state
document.getElementById("productForm").addEventListener("submit", function () {
  const submitBtn = document.getElementById("submitBtn");
  submitBtn.disabled = true;
  submitBtn.classList.add("loading");
  submitBtn.textContent = "Adding Product";
});
