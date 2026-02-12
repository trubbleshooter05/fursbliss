import { POST as runReminders } from "@/app/api/cron/reminders/route";

export async function GET(request: Request) {
  return runReminders(request);
}

export async function POST(request: Request) {
  return runReminders(request);
}
