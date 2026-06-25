import { expect, test } from "@playwright/test";

import { NewPollPage } from "./new-poll-page";

test("reopen a closed poll and verify the manage menu reverts to close", async ({
  page,
}) => {
  const newPollPage = new NewPollPage(page);
  await newPollPage.goto();
  const dialog = await newPollPage.create({ name: "Poll to Reopen" });
  await dialog.goToPollPage();

  // Close the poll
  await page.getByRole("button", { name: "Manage" }).click();
  await page.getByRole("menuitem", { name: "Close" }).click();

  // Reopen the poll
  await page.getByRole("button", { name: "Manage" }).click();
  await page.getByRole("menuitem", { name: "Reopen Poll" }).click();

  // Menu must show "Close" again — the poll is open once more
  await page.getByRole("button", { name: "Manage" }).click();
  await expect(page.getByRole("menuitem", { name: "Close" })).toBeVisible();
});
