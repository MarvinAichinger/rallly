import { expect, test } from "@playwright/test";

import { NewPollPage } from "./new-poll-page";

test("edit poll title and verify the new title appears on the poll page", async ({
  page,
}) => {
  const newPollPage = new NewPollPage(page);
  await newPollPage.goto();
  const dialog = await newPollPage.create({ name: "Original Title" });
  await dialog.goToPollPage();

  await page.getByRole("button", { name: "Manage" }).click();
  await page.getByRole("menuitem", { name: "Edit details" }).click();

  const titleInput = page.getByLabel("Title");
  await titleInput.click({ clickCount: 3 });
  await page.keyboard.type("Updated Title");

  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByRole("heading", { name: "Updated Title" })).toBeVisible();
});
