/*///////////////////////BARRA LATERAL///////////////////////*/
var sidebar = document.querySelector(".sidebar")
var closeBtn = document.querySelector("#btn")
var searchBtn = document.querySelector(".bx-search")

if (closeBtn) { // Verifica si las variables selectoras contienen un elemento
    closeBtn.addEventListener("click", () => {
        sidebar.classList.toggle("open")
        menuBtnChange() //calling the function(optional)
    })

    // following are the code to change sidebar button(optional)
    function menuBtnChange() {
        if (sidebar.classList.contains("open")) {
            closeBtn.classList.replace("bx-menu", "bx-menu-alt-right") //replacing the iocns class
        } else {
            closeBtn.classList.replace("bx-menu-alt-right", "bx-menu") //replacing the iocns class
        }
    }
}

if (searchBtn) // Verifica si las variables selectoras contienen un elemento
    searchBtn.addEventListener("click", () => {
        // Sidebar open when you click on the search iocn
        sidebar.classList.toggle("open")
        menuBtnChange() //calling the function(optional)
    })
/*///////////////////////BARRA LATERAL///////////////////////*/
