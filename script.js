let macroChart;
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
    const quantity = parseFloat(quantityInput.value);

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

        li.style.display = "flex";
li.style.justifyContent = "space-between";
li.style.alignItems = "center";

li.className = "food-item";

li.innerHTML = `
    <span class="food-text">
        ${item.name} x${item.quantity} 
        | ${item.calories} kcal 
        | P:${item.protein}g 
        C:${item.carbs}g 
        F:${item.fat}g
    </span>
    <button class="remove-btn" onclick="removeItem(${index})">
        ❌
    </button>
`;



        list.appendChild(li);
    });

    document.getElementById("totalCalories").textContent = Math.round(totals.calories);
document.getElementById("totalProtein").textContent = totals.protein.toFixed(1);
document.getElementById("totalCarbs").textContent = totals.carbs.toFixed(1);
document.getElementById("totalFat").textContent = totals.fat.toFixed(1);


    updateProgress();

    updateMacroBreakdown();


}

function removeItem(index) {
    const list = document.getElementById("addedFoods");
    const itemElement = list.children[index];

    // Add animation class
    itemElement.classList.add("removing");

    setTimeout(() => {
        const item = addedItems[index];

        totals.calories -= item.calories;
        totals.protein -= item.protein;
        totals.carbs -= item.carbs;
        totals.fat -= item.fat;

        addedItems.splice(index, 1);

        updateUI();
        saveData();
    }, 200); // match CSS transition time
}


function sendToGoogleSheet() {
    fetch("https://script.google.com/macros/s/AKfycbzTUm-8G20fzNtZD87Z55_85m69mSRfMo62EjNZ_Sal_rLXA0dmGx11lNyl_S5J5Fst/exec", {
        method: "POST",
        body: JSON.stringify({
            calories: totals.calories,
            protein: totals.protein,
            carbs: totals.carbs,
            fat: totals.fat,
            goal: calorieGoal
        }),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(res => res.json())
    .then(data => console.log("Sheet Updated:", data))
    .catch(err => console.error("Error:", err));
}

function saveDayToSheet() {

    if (totals.calories === 0) {
        alert("No data to save.");
        return;
    }

    const today = new Date().toDateString();

    if (localStorage.getItem("lastSavedDate") === today) {
    if (!confirm("Already saved today. Save again anyway?")) {
        return;
    }
}


    fetch("https://script.google.com/macros/s/AKfycbzTUm-8G20fzNtZD87Z55_85m69mSRfMo62EjNZ_Sal_rLXA0dmGx11lNyl_S5J5Fst/exec", {
    method: "POST",
    body: JSON.stringify({
        calories: totals.calories,
        protein: totals.protein,
        carbs: totals.carbs,
        fat: totals.fat,
        goal: calorieGoal
    })
})
.then(res => res.text())
.then(data => {
    localStorage.setItem("lastSavedDate", today);
    alert("Day saved to Google Sheet!");
    console.log("Sheet Updated:", data);
})
.catch(err => {
    console.error("Sheet Error:", err);
    alert("Error saving day.");
});

}


function downloadReceipt() {
    const receiptNo = getNextReceiptNumber();
    const { jsPDF } = window.jspdf;

    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, 200]
    });

    const now = new Date();
    const today = now.toLocaleString();

    let y = 25; // leave space for logo

    // --- ADD LOGO FIRST ---
    const img = new Image();
    img.src = "logo.png";

    img.onload = function () {

        // Add logo at top center
        doc.addImage(img, "PNG", 25, 5, 30, 12);

        doc.setFont("courier", "normal");

        // Title
        doc.setFontSize(12);
        doc.text("kCALculator", 40, y, { align: "center" });
        y += 6;

        doc.setFontSize(8);
        doc.text("Receipt No: " + receiptNo, 5, y);
        y += 5;

        doc.text("Date: " + today, 5, y);
        y += 5;

        doc.line(5, y, 75, y);
        y += 5;

        // Header
        doc.text("Item", 5, y);
        doc.text("Qty", 55, y, { align: "right" });
        doc.text("Cal", 75, y, { align: "right" });
        y += 4;

        doc.line(5, y, 75, y);
        y += 5;

        // Items
        addedItems.forEach(item => {
            doc.text(item.name.substring(0, 12), 5, y);
            doc.text(String(item.quantity), 55, y, { align: "right" });
            doc.text(String(item.calories), 75, y, { align: "right" });
            y += 5;
        });

        doc.line(5, y, 75, y);
        y += 6;

        // Totals
        doc.setFontSize(10);
        doc.text("TOTAL:", 5, y);
        doc.text(totals.calories + " kcal", 75, y, { align: "right" });
        y += 6;

        doc.text("Protein:", 5, y);
        doc.text(totals.protein + " g", 75, y, { align: "right" });
        y += 5;

        doc.text("Carbs:", 5, y);
        doc.text(totals.carbs + " g", 75, y, { align: "right" });
        y += 5;

        doc.text("Fat:", 5, y);
        doc.text(totals.fat + " g", 75, y, { align: "right" });

        y += 8;
        doc.line(5, y, 75, y);
        y += 6;

        // Add chart BEFORE footer
y += 5;

const chartCanvas = document.getElementById("macroChart");

if (chartCanvas) {
    const chartImage = chartCanvas.toDataURL("image/png", 1.0);
    doc.addImage(chartImage, "PNG", 10, y, 50, 50); // smaller size
    y += 55;
}


        // Thank you message
        doc.setFontSize(8);
        doc.text("Thank you for tracking with kCALculator.", 40, y, { align: "center" });
        y += 6;

        // Signature
        doc.setFont("courier", "bold");
        doc.text("by Ayush B", 40, y, { align: "center" });
        y += 4;

       // GitHub link
       doc.text("Visit: github.com/ayushbexe", 40, y, { align: "center" });


        // Filename
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        const fileName = `${year}-${month}-${day}_${hours}-${minutes}_kCALculator_Receipt.pdf`;

       
        doc.save(fileName);
    };
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

    const ctx = document.getElementById("macroChart").getContext("2d");

    if (macroChart) {
        macroChart.destroy();
    }

    macroChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Protein", "Carbs", "Fat"],
            datasets: [{
                data: [proteinPercent, carbPercent, fatPercent],
                backgroundColor: [
                    "#8B4513",  // brown
                    "#D2B48C",  // tan
                    "#A0522D"   // darker brown
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        color: "#3b2f2f"
                    }
                }
            }
        }
    });
}


function getNextReceiptNumber() {
    let receiptNumber = localStorage.getItem("receiptNumber");

    if (!receiptNumber) {
        receiptNumber = 1;
    } else {
        receiptNumber = parseInt(receiptNumber) + 1;
    }

    localStorage.setItem("receiptNumber", receiptNumber);

    return String(receiptNumber).padStart(4, "0");
}

function updateUnitLabel() {
    const select = document.getElementById("foodSelect");
    const unitLabel = document.getElementById("unitLabel");

    const selectedFood = foods[select.value];

    if (selectedFood) {
        unitLabel.textContent = "Unit: " + selectedFood.unit;

        if (selectedFood.unit.includes("1g")) {
            document.getElementById("quantityInput").placeholder = "Enter grams eaten";
        } else {
            document.getElementById("quantityInput").placeholder = "Enter number of units";
        }
    }
}
