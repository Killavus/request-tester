import { Fragment } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";

export default function Home() {
  const queryClient = useQueryClient();

  const { data } = useQuery<
    {
      urlMatch: string;
      statusCode: number;
      body?: string;
      method?: "POST" | "GET" | "PATCH" | "PUT";
      enabled: "true" | "false";
    }[]
  >("node-list", () => fetch("/api/list").then((res) => res.json()));

  const add = useMutation<
    { status: "ok" },
    unknown,
    {
      urlMatch: string;
      statusCode: number;
      body?: string;
      method?: string;
    }
  >(
    "add",
    (body) =>
      fetch("/api/add", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((res) => res.json()),
    { onSuccess: () => queryClient.invalidateQueries("node-list") }
  );

  const enable = useMutation<
    { status: "ok" },
    unknown,
    {
      urlMatch: string;
    }
  >(
    "add",
    (body) =>
      fetch("/api/toggle", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((res) => res.json()),
    { onSuccess: () => queryClient.invalidateQueries("node-list") }
  );

  const addMatch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = new FormData(e.currentTarget);

    add.mutate({
      urlMatch: data.get("urlMatch") as string,
      statusCode: parseInt(data.get("statusCode") as string),
      body: data.get("body") as string,
      method: data.get("method") as string,
    });
  };

  return (
    <div className="max-w-[1200px] my-6 mx-auto">
      {(data ?? []).map((node) => (
        <Fragment key={node.urlMatch}>
          <dl className="grid grid-cols-2">
            <dt className="font-bold">URL Match</dt>
            <dd>{node.urlMatch}</dd>
            <dt className="font-bold">Status code:</dt>
            <dd>{node.statusCode}</dd>
            <dt className="font-bold">Body:</dt>
            <dd>{node.body ?? "<not set>"}</dd>
            <dt className="font-bold">Method:</dt>
            <dd>{node.method ?? "Any"}</dd>
            <dt className="font-bold">Enabled?:</dt>
            <dd>
              <span
                className={
                  node.enabled === "true" ? "text-green-800" : "text-red-800"
                }
              >
                {node.enabled}
              </span>
              <button
                className="text-blue-500"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  enable.mutate({ urlMatch: node.urlMatch });
                }}
              >
                [Toggle]
              </button>
            </dd>
          </dl>
          <hr className="border-t my-4" />
        </Fragment>
      ))}
      <form
        onSubmit={addMatch}
        className="grid grid-cols-2 grid-flow-row gap-x-2 gap-y-2"
      >
        <label className="grid col-span-2 font-bold grid-cols-[subgrid]">
          URL match:
          <input
            type="text"
            name="urlMatch"
            className="border-black border flex-1 font-normal"
          />
        </label>

        <label className="grid col-span-2 font-bold grid-cols-[subgrid]">
          HTTP Status Code:
          <input
            type="number"
            className="border-black border flex-1 font-normal"
            name="statusCode"
          />
        </label>

        <label className="grid col-span-2 font-bold grid-cols-[subgrid]">
          Body:
          <textarea
            name="body"
            className="border-black border flex-1 font-normal"
          />
        </label>
        <label className="grid col-span-2 font-bold grid-cols-[subgrid]">
          Method:
          <select
            name="method"
            className="border-black border flex-1 font-normal"
          >
            <option value="any">Any</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PATCH">PATCH</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </label>

        <div className="flex justify-center col-span-2">
          <button type="submit" className="border-black border px-4 rounded-lg">
            Add / Edit
          </button>
        </div>
      </form>
    </div>
  );
}
