import { expect, test } from "@playwright/test";

import { NewPollPage } from "./new-poll-page";

test("edit poll title and verify the new title appears on the poll page", async ({
  page,
}) => {
  const newPollPage = new NewPollPage(page);
  await newPollPage.goto();
  const dialog = await newPollPage.create({ name: "Original Title" });
  await dialog.goToPollPage();

  // Navigate to edit-details via the Manage dropdown
  await page.getByRole("button", { name: "Manage" }).click();
  await page.getByRole("menuitem", { name: "Edit details" }).click();

  // Replace the title — triple-click selects all, then type the new value
  const titleInput = page.getByLabel("Title");
  await titleInput.click({ clickCount: 3 });
  await page.keyboard.type("Updated Title");

  await page.getByRole("button", { name: "Save" }).click();

  // After save, the app redirects back to the poll page
  await expect(page.getByRole("heading", { name: "Updated Title" })).toBeVisible();
});
