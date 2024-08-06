import { test, expect, beforeAll, afterAll } from "bun:test";
import { app } from "..";
import path from "path";

test("POST /avatars/123 is ok", async () => {
   const formData = new FormData();
   formData.append("files[0]", Bun.file(__dirname + "/pixel.png"), "pixel.png");

   const result = await app.request("/avatars/123", { method: "POST", body: formData });

   expect(result.ok).toBeTrue();
   expect(await result.text()).toBe("pixel.png");
});

test("GET /avatars/123/pixel.png exists", async () => {
   const result = await app.request("/avatars/123/pixel.png", { method: "GET" });

   expect(result.ok).toBeTrue();

   const fileData = await Bun.file(path.join(__dirname, "pixel.png")).arrayBuffer();
   const requestData = await result.arrayBuffer();

   expect(Buffer.from(fileData, 0).equals(Buffer.from(requestData, 0))).toBeTrue();
});

test("GET /avatars/123/pixel.jpeg exists", async () => {
   const results = await Promise.all([
      app.request("/avatars/123/pixel.jpeg", { method: "GET" }),
      app.request("/avatars/123/pixel.jpg", { method: "GET" }),
      app.request("/avatars/123/pixel.webp", { method: "GET" }),
   ]);

   expect(results.every(x => x.ok)).toBeTrue();

   for (const format of ["jpeg", "jpg", "webp"]) {
      const file = Bun.file(path.join(__dirname, "..", "..", "uploads", "avatars", `pixel.${format}`));
      expect(await file.exists()).toBeTrue();
   }
});
