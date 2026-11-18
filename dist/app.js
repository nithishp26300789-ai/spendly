"use strict";
/* =========================================================================
   Spendly — a mini expense tracker (starter)
   Fill in every TODO. Your code must compile with `npm run build`
   (tsc, strict mode) with ZERO type errors. Do NOT use `any` to dodge types.
   See TODO.md for the task list and marks.
   ========================================================================= */
/* -------------------------------------------------------------------------
   TASK 1 — Enum (LU: Enums & Tuples)
   TODO: Define a string enum `Category` with: Food, Travel, Bills, Other.
   ------------------------------------------------------------------------- */
var Category;
(function (Category) {
    Category["Food"] = "Food";
    Category["Travel"] = "Travel";
    Category["Bills"] = "Bills";
    Category["Other"] = "Other";
})(Category || (Category = {}));
/* In-memory store (already typed once you define Expense above). */
const expenses = [];
let nextId = 1;
/* -------------------------------------------------------------------------
   TASK 5 — Type guard / narrowing (LU: Type Guards & Narrowing)
   TODO: Write `toNewExpense` that takes the RAW form strings and either
         returns a valid `NewExpense` or `null`.
         Use typeof / Number checks and verify the category is a real enum
         value. Reject: empty title, non-positive or non-numeric amount,
         invalid category. No `any`.
   ------------------------------------------------------------------------- */
function isCategory(value) {
    return Object.values(Category).some((category) => category === value);
}
function toNewExpense(title, amountRaw, category) {
    if (typeof title !== "string" || typeof amountRaw !== "string" || typeof category !== "string") {
        return null;
    }
    const trimmedTitle = title.trim();
    const amount = Number(amountRaw);
    if (trimmedTitle.length === 0 ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        !isCategory(category)) {
        return null;
    }
    return { title: trimmedTitle, amount, category };
}
/* -------------------------------------------------------------------------
   TASK 6 — Core logic
   TODO: total()      -> sum of all expense amounts (number)
         breakdown()  -> SummaryRow[] : one [category, total] row per Category
   ------------------------------------------------------------------------- */
function total() {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}
function breakdown() {
    const totals = {
        [Category.Food]: 0,
        [Category.Travel]: 0,
        [Category.Bills]: 0,
        [Category.Other]: 0,
    };
    expenses.forEach((expense) => {
        totals[expense.category] += expense.amount;
    });
    return Object.values(Category).map((category) => [category, totals[category]]);
}
/* -------------------------------------------------------------------------
   TASK 7 — DOM wiring + render (LU: TypeTasks UI, Build & Ship)
   TODO:
     - Grab the form + inputs with getElementById and cast to the right
       HTMLElement types (e.g. `as HTMLInputElement`).
     - On submit: preventDefault, call toNewExpense, show an error message
       if invalid, else push a full Expense (add the id) and re-render.
     - render(): paint the #list, #total, and #breakdown from the data.
   ------------------------------------------------------------------------- */
const form = document.getElementById("expense-form");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const errorMessage = document.getElementById("error");
const expenseList = document.getElementById("list");
const totalOutput = document.getElementById("total");
const breakdownList = document.getElementById("breakdown");
function describeExpense(expense) {
    return `${expense.title} · ${expense.category}`;
}
function render() {
    expenseList.replaceChildren();
    expenses.forEach((expense) => {
        const item = document.createElement("li");
        const description = document.createElement("span");
        const amount = document.createElement("span");
        description.textContent = describeExpense(expense);
        amount.textContent = expense.amount.toFixed(2);
        item.append(description, amount);
        expenseList.append(item);
    });
    totalOutput.textContent = `Total: ${total().toFixed(2)}`;
    breakdownList.replaceChildren();
    breakdown().forEach(([category, amount]) => {
        const item = document.createElement("li");
        const categoryLabel = document.createElement("span");
        const categoryTotal = document.createElement("span");
        categoryLabel.textContent = category;
        categoryTotal.textContent = amount.toFixed(2);
        item.append(categoryLabel, categoryTotal);
        breakdownList.append(item);
    });
}
form.addEventListener("submit", (event) => {
    event.preventDefault();
    const newExpense = toNewExpense(titleInput.value, amountInput.value, categoryInput.value);
    if (newExpense === null) {
        errorMessage.textContent = "Enter a title, a positive amount, and a valid category.";
        return;
    }
    errorMessage.textContent = "";
    expenses.push({ id: nextId, ...newExpense });
    nextId += 1;
    form.reset();
    render();
});
/* Call render() once on load so the UI reflects the (empty) state. */
render();
