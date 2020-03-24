var languageSelectElement = document.querySelectorAll(".language-select")
var splittedPath = window.location.pathname.split('/')

var path = {
  language: splittedPath[1],
  page: splittedPath.slice(2).join('/')
}

languageSelectElement.forEach(function(element) {
  if (element.tagName === "SELECT") {
    element.value = path.language

    element.addEventListener("change", function(event) {
      var language = event && event.target && event.target.value || null

      if (language !== null) {
        window.location = '/' + language + '/' + path.page
      }
    })
  }
})
