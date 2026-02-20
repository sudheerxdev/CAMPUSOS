import { expect, test } from "@playwright/test";

test.describe("CAMPUSOS smoke flows", () => {
  test("study planner can add a task", async ({ page }) => {
    const title = `Playwright Task ${Date.now()}`;

    await page.goto("/app/study-planner");
    await page.getByPlaceholder("Task title").fill(title);
    await page.getByPlaceholder("Subject").fill("E2E Testing");
    await page.getByRole("button", { name: "Add Task" }).click();

    await expect(page.getByText(title)).toBeVisible();
  });

  test("focus timer can start and pause", async ({ page }) => {
    page.on("dialog", (dialog) => dialog.dismiss());
    await page.addInitScript(() => {
      window.alert = () => undefined;
    });
    await page.goto("/app/focus");

    const timer = page.getByText(/^\d{2}:\d{2}$/).first();
    const initialTimerValue = (await timer.innerText()).trim();

    await page.getByRole("button", { name: "Start" }).click();
    await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
    await page.waitForTimeout(1_200);

    const runningValue = (await timer.innerText()).trim();
    expect(runningValue).not.toBe(initialTimerValue);

    await page.getByRole("button", { name: "Pause" }).click();
    await expect(page.getByRole("button", { name: "Start" })).toBeVisible();
  });

  test("settings import shows restore preview and compatibility", async ({ page }) => {
    const backupPayload = {
      version: 1,
      exportedAt: "2026-02-20T00:00:00.000Z",
      data: {
        tasks: [{ id: "t1" }],
        exams: [{ id: "e1" }],
        goals: [{ id: "g1" }],
        resources: [{ id: "r1" }],
        placement: { applications: [{ id: "a1" }] },
      },
      notes: [
        {
          id: "n1",
          title: "Imported note",
          subject: "General",
          format: "markdown",
          content: "hello",
          updatedAt: "2026-02-20T00:00:00.000Z",
        },
      ],
    };

    await page.goto("/app/settings");

    await page.locator('input[type="file"]').setInputFiles({
      name: "backup.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(backupPayload), "utf8"),
    });

    const restorePreview = page
      .locator("div")
      .filter({ hasText: "Restore Preview" })
      .filter({ hasText: "Apply Restore" })
      .first();

    await expect(restorePreview).toBeVisible();
    await expect(restorePreview.getByText("compatible")).toBeVisible();
    await expect(restorePreview.getByText("Tasks: 1")).toBeVisible();
    await expect(restorePreview.getByText("Exams: 1")).toBeVisible();
    await expect(restorePreview.getByText("Goals: 1")).toBeVisible();
    await expect(restorePreview.getByText("Resources: 1")).toBeVisible();
    await expect(restorePreview.getByText("Applications: 1")).toBeVisible();
    await expect(restorePreview.getByText("Notes: 1")).toBeVisible();
  });

  test("notes can be created and persist after reload", async ({ page }) => {
    const noteTitle = `Playwright Note ${Date.now()}`;
    const noteBody = "This is a smoke test note body.";

    await page.goto("/app/notes");
    await page.getByRole("button", { name: "New Note" }).click();
    await page.getByPlaceholder("Title").fill(noteTitle);
    await page.getByPlaceholder("Subject").fill("Smoke");
    await page.getByPlaceholder("# Write your markdown note").fill(noteBody);

    await expect(page.getByText(noteTitle)).toBeVisible();

    await page.reload();
    await expect(page.getByText(noteTitle)).toBeVisible();
  });
});
