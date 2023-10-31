import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "redis";

type Data = any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const client = await createClient()
    .on("error", (err) => console.log("Redis Client Error", err))
    .connect();

  const { urlMatch: urlMatchRaw, statusCode, body, method } = req.body;
  const urlMatch = urlMatchRaw.trim();
  const urls = await client.lRange("override:urls", 0, -1);
  if (!urls.includes(urlMatch)) {
    await client.lPush("override:urls", urlMatch);
  }

  await client.hSet(`override:${urlMatch}`, "statusCode", statusCode);
  await client.hSet(`override:${urlMatch}`, "urlMatch", urlMatch);
  if (body) {
    await client.hSet(`override:${urlMatch}`, "body", body);
  }

  if (method && method !== "any") {
    await client.hSet(`override:${urlMatch}`, "method", method);
  }

  await client.hSet(`override:${urlMatch}`, "enabled", "false");

  res.status(200).json({ status: "ok" });
}
