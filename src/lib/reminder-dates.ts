import type { TaxReminder } from "./data";
// Repeated dates are planning estimates, not official tax filing schedules.
export function nextReminderDate(reminder: TaxReminder, today = new Date()): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(reminder.dueDate);
  if (!match) return reminder.dueDate;
  const frequency = reminder.frequency || "once";
  if (frequency === "once") return reminder.dueDate;
  const year = +match[1], month = +match[2] - 1, day = +match[3];
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const step = frequency === "quarterly" ? 3 : 12;
  let months = 0;
  for (let i = 0; i < 240; i++) {
    const d = new Date(year, month + months, 1);
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(day, last));
    if (d >= current) return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
    months += step;
  }
  return reminder.dueDate;
}
