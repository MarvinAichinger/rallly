import { expect, test } from "@playwright/test";

import { NewPollPage } from "./new-poll-page";

test("close a poll and verify the manage menu switches to reopen", async ({
  page,
}) => {
  const newPollPage = new NewPollPage(page);
  await newPollPage.goto();
  const dialog = await newPollPage.create({ name: "Poll to Close" });
  await dialog.goToPollPage();

  // Close the poll via the Manage dropdown
  await page.getByRole("button", { name: "Manage" }).click();
  await page.getByRole("menuitem", { name: "Close" }).click();

  // Re-open the dropdown — the item must have switched to "Reopen Poll"
  await page.getByRole("button", { name: "Manage" }).click();
  await expect(
    page.getByRole("menuitem", { name: "Reopen Poll" }),
  ).toBeVisible();
});
