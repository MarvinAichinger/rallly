import { expect, test } from "@playwright/test";
import { prisma } from "@rallly/database";
import { deleteAllMessages } from "@rallly/test-helpers";

import { createUserInDb, loginWithEmail } from "./test-utils";

const testEmail = "profile-settings-test@example.com";

test.describe.serial(() => {
  test.beforeAll(async () => {
    await deleteAllMessages();
    await createUserInDb({ email: testEmail, name: "Original Name" });
  });

  test.afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
  });

  test("update display name and verify it persists after reload", async ({
    page,
  }) => {
    await loginWithEmail(page, { email: testEmail });

    await page.goto("/settings/profile");

    const nameInput = page.getByLabel("Name");
    await nameInput.clear();
    await nameInput.fill("Updated Name");

    await page.getByRole("button", { name: "Save" }).click();

    await page.reload();

    await expect(nameInput).toHaveValue("Updated Name");
  });
});
