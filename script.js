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

    updateMacroBreakdown();


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
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const now = new Date();
    const today = now.toLocaleString();

    let y = 20;

    doc.setFont("courier", "normal");

    // Title
    doc.setFontSize(16);
    doc.text("kCALculator", 105, y, { align: "center" });
    y += 8;

    doc.setFontSize(10);
    doc.text("Nutrition Tracking Receipt", 105, y, { align: "center" });
    y += 10;

    doc.text("Date: " + today, 20, y);
    y += 8;

    // Line
    doc.line(20, y, 190, y);
    y += 8;

    // Table Header
    doc.text("Item", 20, y);
    doc.text("Qty", 120, y, { align: "right" });
    doc.text("Calories", 190, y, { align: "right" });
    y += 6;

    doc.line(20, y, 190, y);
    y += 8;

    // Items
    addedItems.forEach(item => {
        doc.text(item.name.substring(0, 20), 20, y);
        doc.text(String(item.quantity), 120, y, { align: "right" });
        doc.text(String(item.calories), 190, y, { align: "right" });
        y += 8;
    });

    y += 4;
    doc.line(20, y, 190, y);
    y += 10;

    // Totals Section
    doc.setFontSize(12);
    doc.text("TOTAL CALORIES", 20, y);
    doc.text(String(totals.calories) + " kcal", 190, y, { align: "right" });
    y += 10;

    doc.setFontSize(10);
    doc.text("Protein:", 20, y);
    doc.text(totals.protein + " g", 190, y, { align: "right" });
    y += 6;

    doc.text("Carbs:", 20, y);
    doc.text(totals.carbs + " g", 190, y, { align: "right" });
    y += 6;

    doc.text("Fat:", 20, y);
    doc.text(totals.fat + " g", 190, y, { align: "right" });
    y += 10;

    // Footer Line
    doc.line(20, y, 190, y);
    y += 8;

    doc.setFontSize(9);
    doc.text("Macro Split:", 20, y);
    y += 6;

    const proteinCal = totals.protein * 4;
    const carbCal = totals.carbs * 4;
    const fatCal = totals.fat * 9;
    const totalMacroCal = proteinCal + carbCal + fatCal;

    if (totalMacroCal > 0) {
        const p = ((proteinCal / totalMacroCal) * 100).toFixed(1);
        const c = ((carbCal / totalMacroCal) * 100).toFixed(1);
        const f = ((fatCal / totalMacroCal) * 100).toFixed(1);

        doc.text(`Protein: ${p}%`, 20, y);
        y += 5;
        doc.text(`Carbs: ${c}%`, 20, y);
        y += 5;
        doc.text(`Fat: ${f}%`, 20, y);
        y += 10;
    }

    doc.setFontSize(9);
    doc.text("Thank you for tracking with kCALculator.", 105, y, { align: "center" });

    const now = new Date();

const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
const day = String(now.getDate()).padStart(2, '0');
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');

const fileName = `${year}-${month}-${day}_${hours}-${minutes}_kCALculator_Receipt.pdf`;

doc.save(fileName);

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

function addCustomFood() {
    const name = document.getElementById("customName").value;
    const calories = parseFloat(document.getElementById("customCalories").value);
    const protein = parseFloat(document.getElementById("customProtein").value);
    const carbs = parseFloat(document.getElementById("customCarbs").value);
    const fat = parseFloat(document.getElementById("customFat").value);

    if (!name || !calories) {
        alert("Enter valid food details");
        return;
    }

    const newFood = {
        name: name,
        unit: "1 unit",
        calories: calories,
        protein: protein || 0,
        carbs: carbs || 0,
        fat: fat || 0
    };

    foods.push(newFood);
    populateDropdown();

    document.getElementById("customName").value = "";
    document.getElementById("customCalories").value = "";
    document.getElementById("customProtein").value = "";
    document.getElementById("customCarbs").value = "";
    document.getElementById("customFat").value = "";
}

function updateMacroBreakdown() {
    const proteinCalories = totals.protein * 4;
    const carbCalories = totals.carbs * 4;
    const fatCalories = totals.fat * 9;

    const totalMacroCalories = proteinCalories + carbCalories + fatCalories;

    if (totalMacroCalories === 0) return;

    const proteinPercent = ((proteinCalories / totalMacroCalories) * 100).toFixed(1);
    const carbPercent = ((carbCalories / totalMacroCalories) * 100).toFixed(1);
    const fatPercent = ((fatCalories / totalMacroCalories) * 100).toFixed(1);

    document.getElementById("macroDisplay").textContent =
    `Protein: ${proteinPercent}% | Carbs: ${carbPercent}% | Fat: ${fatPercent}%`;


    
}
