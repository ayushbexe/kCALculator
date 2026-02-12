let foods = [];
let totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
};

let addedItems = [];

// Load food data
fetch('foods.json')
    .then(response => response.json())
    .then(data => {
        foods = data;
        populateDropdown();
    });

function populateDropdown() {
    const select = document.getElementById("foodSelect");

    foods.forEach((food, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = `${food.name} (${food.unit})`;
        select.appendChild(option);
    });
}

function addSelectedFood() {
    const select = document.getElementById("foodSelect");
    const quantityInput = document.getElementById("quantityInput");

    const foodIndex = select.value;
    const quantity = parseInt(quantityInput.value);

    if (foodIndex === "" || !quantity || quantity <= 0) {
        alert("Please select food and valid quantity");
        return;
    }

    const food = foods[foodIndex];

    const item = {
        name: food.name,
        quantity: quantity,
        calories: food.calories * quantity,
        protein: food.protein * quantity,
        carbs: food.carbs * quantity,
        fat: food.fat * quantity
    };

    addedItems.push(item);

    totals.calories += item.calories;
    totals.protein += item.protein;
    totals.carbs += item.carbs;
    totals.fat += item.fat;

    updateUI();
    quantityInput.value = "";
}

function updateUI() {
    const list = document.getElementById("addedFoods");
    list.innerHTML = "";

    addedItems.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.name} x${item.quantity} 
        | ${item.calories} kcal 
        | P:${item.protein}g 
        C:${item.carbs}g 
        F:${item.fat}g`;
        list.appendChild(li);
    });

    document.getElementById("totalCalories").textContent = totals.calories;
    document.getElementById("totalProtein").textContent = totals.protein;
    document.getElementById("totalCarbs").textContent = totals.carbs;
    document.getElementById("totalFat").textContent = totals.fat;
}

function downloadReceipt() {
    const today = new Date().toLocaleDateString();

    let content = `kCALculator Receipt\nDate: ${today}\n\n`;

    addedItems.forEach(item => {
        content += `${item.name} x${item.quantity}
Calories: ${item.calories}
Protein: ${item.protein}g
Carbs: ${item.carbs}g
Fat: ${item.fat}g\n\n`;
    });

    content += `TOTALS
Calories: ${totals.calories}
Protein: ${totals.protein}g
Carbs: ${totals.carbs}g
Fat: ${totals.fat}g`;

    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `kCALculator_${today}.txt`;
    link.click();
}
