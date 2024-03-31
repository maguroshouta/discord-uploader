"use client";

import { HOST } from "@/app/constant";
import { FormEvent, useState } from "react";

export default function UploadForm() {
  const [isUpload, setIsUpload] = useState(false);

  async function fileUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsUpload(true);
    const file = e.currentTarget.file.files[0];

    if (!file) {
      setIsUpload(false);
      return;
    }

    let last_message_id = null;

    const chunk_count = Math.ceil(file.size / 26214400);

    for (let i = 0; i < chunk_count; i++) {
      const chunk = file.slice(i * 26214400, (i + 1) * 26214400);
      const formData = new FormData();
      formData.append("file", chunk);
      formData.append("index", i.toString());
      formData.append("chunk_count", chunk_count.toString());
      formData.append("file_name", file.name.toString());
      formData.append("file_size", file.size.toString());

      if (last_message_id) {
        formData.append("last_message_id", last_message_id);
      }

      const res_file = await fetch(`${HOST}/api/files`, {
        method: "POST",
        body: formData,
      });

      const file_json = await res_file.json();
      last_message_id = file_json.id;

      if (res_file.status !== 202) {
        location.reload();
        setIsUpload(false);
        return;
      }
    }
  }

  return (
    <form onSubmit={fileUpload} className="flex flex-col gap-4">
      <input type="file" name="file" />
      <button className="w-32 rounded-md bg-sky-500 p-2 disabled:bg-gray-400 transition-all" type="submit" disabled={isUpload}>
        アップロード
      </button>
    </form>
  );
}
