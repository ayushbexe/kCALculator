let foods = [];
let totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
};
let calorieGoal = 0;

let addedItems = [];

// Load food data
fetch('foods.json')
    .then(response => response.json())
    .then(data => {
        foods = data;
        populateDropdown();
        loadData();
    });

function saveData() {
    const data = {
        addedItems,
        totals,
        calorieGoal
    };

    localStorage.setItem("kCALculatorData", JSON.stringify(data));
}

function loadData() {
    const saved = localStorage.getItem("kCALculatorData");

    if (!saved) return;

    const data = JSON.parse(saved);

    addedItems = data.addedItems || [];
    totals = data.totals || totals;
    calorieGoal = data.calorieGoal || 0;

    document.getElementById("calorieGoal").value = calorieGoal;

    updateUI();
}


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
    saveData();

}

function updateUI() {
    const list = document.getElementById("addedFoods");
    list.innerHTML = "";

    addedItems.forEach((item, index) => {
        const li = document.createElement("li");

        li.innerHTML = `
            ${item.name} x${item.quantity} 
            | ${item.calories} kcal 
            | P:${item.protein}g 
            C:${item.carbs}g 
            F:${item.fat}g
            <button onclick="removeItem(${index})" style="margin-left:10px;background:#ff4444;color:white;border:none;padding:4px 6px;border-radius:4px;cursor:pointer;">
                ❌
            </button>
        `;

        list.appendChild(li);
    });

    document.getElementById("totalCalories").textContent = totals.calories;
    document.getElementById("totalProtein").textContent = totals.protein;
    document.getElementById("totalCarbs").textContent = totals.carbs;
    document.getElementById("totalFat").textContent = totals.fat;

    updateProgress();

}

function removeItem(index) {
    const item = addedItems[index];

    totals.calories -= item.calories;
    totals.protein -= item.protein;
    totals.carbs -= item.carbs;
    totals.fat -= item.fat;

    addedItems.splice(index, 1);

    updateUI();
    saveData();

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

function setGoal() {
    const goalInput = document.getElementById("calorieGoal").value;

    if (!goalInput || goalInput <= 0) {
        alert("Enter a valid calorie goal");
        return;
    }

    calorieGoal = parseInt(goalInput);
    updateProgress();
    saveData();

}



function updateProgress() {
    if (calorieGoal === 0) return;

    const percentage = Math.min((totals.calories / calorieGoal) * 100, 100);

    document.getElementById("progressBar").style.width = percentage + "%";
    document.getElementById("goalStatus").textContent =
        percentage.toFixed(1) + "% of goal reached";
}
