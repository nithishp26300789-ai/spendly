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
enum Category {
  Food = "Food",
  Travel = "Travel",
  Bills = "Bills",
  Other = "Other",
}

/* -------------------------------------------------------------------------
   TASK 2 — Model type (LU: TypeTasks Model & Types)
   TODO: Define an `Expense` interface/type with:
         id: number, title: string, amount: number, category: Category
   ------------------------------------------------------------------------- */
interface Expense {
  id: number;
  title: string;
  amount: number;
  category: Category;
}

/* -------------------------------------------------------------------------
   TASK 3 — Utility types (LU: Utility Types)
   TODO: Using the utility types, declare:
         - NewExpense = Omit<Expense, "id">        // what the form produces
         - Breakdown  = Record<Category, number>    // per-category totals
         - (one more) Partial<Expense> OR Pick<...> used somewhere sensible
   ------------------------------------------------------------------------- */
type NewExpense = Omit<Expense, "id">;
type Breakdown = Record<Category, number>;
type ExpenseDescription = Pick<Expense, "title" | "category">;

/* -------------------------------------------------------------------------
   TASK 4 — Tuple (LU: Enums & Tuples)
   TODO: Define a tuple type `SummaryRow` = [Category, number]
         (used to return each breakdown row).
   ------------------------------------------------------------------------- */
type SummaryRow = [Category, number];

/* In-memory store (already typed once you define Expense above). */
const expenses: Expense[] = [];
let nextId = 1;

/* -------------------------------------------------------------------------
   TASK 5 — Type guard / narrowing (LU: Type Guards & Narrowing)
   TODO: Write `toNewExpense` that takes the RAW form strings and either
         returns a valid `NewExpense` or `null`.
         Use typeof / Number checks and verify the category is a real enum
         value. Reject: empty title, non-positive or non-numeric amount,
         invalid category. No `any`.
   ------------------------------------------------------------------------- */
function isCategory(value: string): value is Category {
  return Object.values(Category).some((category) => category === value);
}

function toNewExpense(
  title: string,
  amountRaw: string,
  category: string,
): NewExpense | null {
  if (typeof title !== "string" || typeof amountRaw !== "string" || typeof category !== "string") {
    return null;
  }

  const trimmedTitle = title.trim();
  const amount = Number(amountRaw);

  if (
    trimmedTitle.length === 0 ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !isCategory(category)
  ) {
    return null;
  }

  return { title: trimmedTitle, amount, category };
}

/* -------------------------------------------------------------------------
   TASK 6 — Core logic
   TODO: total()      -> sum of all expense amounts (number)
         breakdown()  -> SummaryRow[] : one [category, total] row per Category
   ------------------------------------------------------------------------- */
function total(): number {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

function breakdown(): SummaryRow[] {
  const totals: Breakdown = {
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
const form = document.getElementById("expense-form") as HTMLFormElement;
const titleInput = document.getElementById("title") as HTMLInputElement;
const amountInput = document.getElementById("amount") as HTMLInputElement;
const categoryInput = document.getElementById("category") as HTMLSelectElement;
const errorMessage = document.getElementById("error") as HTMLParagraphElement;
const expenseList = document.getElementById("list") as HTMLUListElement;
const totalOutput = document.getElementById("total") as HTMLParagraphElement;
const breakdownList = document.getElementById("breakdown") as HTMLUListElement;

function describeExpense(expense: ExpenseDescription): string {
  return `${expense.title} · ${expense.category}`;
}

function render(): void {
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

form.addEventListener("submit", (event: SubmitEvent) => {
  event.preventDefault();

  const newExpense = toNewExpense(
    titleInput.value,
    amountInput.value,
    categoryInput.value,
  );

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
