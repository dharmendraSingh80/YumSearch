// initial-refrences
const searchBtn = document.getElementById("search-btn");
const mealList = document.getElementById("meal");
const mealDetailsContent = document.getElementById("meal-details-container");
const favouritesBody = document.getElementById("favourites-body");

// it makes a favourites meal array if its not exist in local storage
if (localStorage.getItem("favouritesList") == null) {
  localStorage.setItem("favouritesList", JSON.stringify([]));
}

//event listener
searchBtn.addEventListener("click", getMealList);

// Show modal of recipe in favourites modal(nesting of modal)
function showModal(modal) {
  const mid = document.getElementById(modal);
  let myModal = new bootstrap.Modal(mid);
  myModal.show();
}

//get meal list that matches with the ingredients
function getMealList() {
  let arr = JSON.parse(localStorage.getItem("favouritesList"));
  let searchInputTxt = document.getElementById("search-input").value.trim();
  fetch(
    `https://www.themealdb.com/api/json/v1/1/filter.php?i=${searchInputTxt}`
  )
    .then((res) => res.json())
    .then((data) => {
      let html = "";
      if (data.meals) {
        data.meals.forEach((meal) => {
          let isFav = false;
          for (let index = 0; index < arr.length; index++) {
            if (arr[index] == meal.idMeal) {
              isFav = true;
            }
          }
          html += `
            <div class="meal-item">
                <div class="meal-img">
                    <img src="${meal.strMealThumb}"
                        alt="food">
                </div>
                <div class="meal-name">
                    <h3>${meal.strMeal}</h3>
                    <span class = "d-flex justify-content-around">
                    <button type="button" class="recipe-btn" data-bs-toggle="modal" data-bs-target="#meal-details" onclick="getMealRecipe(${
                      meal.idMeal
                    })">Recipe</button>
                    <button class="recipe-btn" onclick="addRemoveToFavList(${
                      meal.idMeal
                    })" >${isFav ? "Unfavourite" : "Favourite"}</button>
                    </span>
                </div>
            </div>
        `;
        });
        mealList.classList.remove("notFound");
      } else {
        html = "Sorry, we didn't find any meal !!";
        mealList.classList.add("notFound");
      }
      mealList.innerHTML = html;
    });
}

//get recipe of the meal
async function getMealRecipe(id) {
  await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
    .then((res) => res.json())
    .then((data) => mealRecipeModal(data.meals));
}
//create a modal-body for recipe-details
function mealRecipeModal(meal) {
  // console.log(meal);
  meal = meal[0];
  let html = `
    <h2 class="recipe-title">${meal.strMeal}</h2>
    
        <p class="recipe-category">Category : ${meal.strCategory}</p>
        <div class="recipe-meal-img">
            <img src="${meal.strMealThumb}"
                alt="">
        </div>
        <div class="recipe-instruct">
            <h3>Instructions</h3>
            <p>${meal.strInstructions}</p>
        </div>
        
        <div class="recipe-link">
            <a href="${meal.strYoutube}" target="_blank">Watch Video</a>
        </div>
  `;
  mealDetailsContent.innerHTML = html;
}

// it shows all favourites meals in favourites body
async function showFavMealList() {
  let arr = JSON.parse(localStorage.getItem("favouritesList"));
  let html = "";
  if (arr.length == 0) {
    html += `
              No meal added to your favourite list!!
            `;
    favouritesBody.classList.add("notFound");
  } else {
    for (let index = 0; index < arr.length; index++) {
      await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${arr[index]}`
      )
        .then((res) => res.json())
        .then((data) => {
          html += `
            <div class="meal-item ">
                <div class="meal-img">
                    <img src="${data.meals[0].strMealThumb}"
                        alt="food">
                </div>
                <div class="meal-name">
                    <h3>${data.meals[0].strMeal}</h3>
                    <span class = "d-flex justify-content-around">
                    <button type="button" class="recipe-btn showmodal"
                    data-show-modal="meal-details"
                    
                     onclick="getMealRecipe(${data.meals[0].idMeal})">Recipe</button>
                    <button onclick="addRemoveToFavList(${data.meals[0].idMeal})"  class="recipe-btn">
                     Unfavourite
                    </button>
                    </span>
                </div>
            </div>
        `;
        });
    }
    favouritesBody.classList.remove("notFound");
  }

  favouritesBody.innerHTML = html;
}
//it adds and remove meals to favourites list
async function addRemoveToFavList(id) {
  let arr = JSON.parse(localStorage.getItem("favouritesList"));
  let contain = false;
  for (let index = 0; index < arr.length; index++) {
    if (id == arr[index]) {
      contain = true;
    }
  }
  if (contain) {
    let number = arr.indexOf(id);
    arr.splice(number, 1);
    alert("Meal is removed from your favourites");
  } else {
    arr.push(id);
    alert("Meal is added to your favourites");
  }
  localStorage.setItem("favouritesList", JSON.stringify(arr));
  getMealList();
  await showFavMealList();
  Array.from(document.getElementsByClassName("showmodal")).forEach((e) => {
    e.addEventListener("click", function (element) {
      element.preventDefault();
      console.log(element);
      if (e.hasAttribute("data-show-modal")) {
        showModal(e.getAttribute("data-show-modal"));
      }
    });
  });
}

window.onload = async function () {
  await showFavMealList();
  //handling recipe modal over favourites modal
  Array.from(document.getElementsByClassName("showmodal")).forEach((e) => {
    e.addEventListener("click", function (element) {
      element.preventDefault();
      console.log(element);
      if (e.hasAttribute("data-show-modal")) {
        showModal(e.getAttribute("data-show-modal"));
      }
    });
  });
};
