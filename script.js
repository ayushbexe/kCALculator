let totalCalories = 0;
let totalProtein = 0;
let totalCarbs = 0;
let totalFat = 0;

function addFood(food, quantity) {
  totalCalories += food.calories * quantity;
  totalProtein += food.protein * quantity;
  totalCarbs += food.carbs * quantity;
  totalFat += food.fat * quantity;

  updateUI();
}

function updateUI() {
  document.getElementById("calories").innerText = totalCalories;
  document.getElementById("protein").innerText = totalProtein;
  document.getElementById("carbs").innerText = totalCarbs;
  document.getElementById("fat").innerText = totalFat;
}

function downloadReceipt() {
  const today = new Date().toLocaleDateString();

  const content = `
  kCALculator Receipt
  Date: ${today}

  Calories: ${totalCalories}
  Protein: ${totalProtein}
  Carbs: ${totalCarbs}
  Fat: ${totalFat}
  `;

  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "kCALculator_receipt.txt";
  link.click();
}
