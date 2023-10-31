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

  const { urlMatch } = req.body;

  const enabled = await client.hGet(`override:${urlMatch}`, "enabled");

  if (["true", "false"].includes(enabled ?? "")) {
    if (enabled === "false") {
      await client.hSet(`override:${urlMatch}`, "enabled", "true");
    } else {
      await client.hSet(`override:${urlMatch}`, "enabled", "false");
    }
  }

  res.status(200).json({ status: "ok" });
}
