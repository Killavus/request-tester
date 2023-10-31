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

  const urls = await client.lRange("override:urls", 0, -1);
  const allUrls = (
    await Promise.all(urls.map((url) => client.hGetAll(`override:${url}`)))
  ).filter((o) => Object.keys(o).length > 0);

  res.status(200).json(allUrls);
}
