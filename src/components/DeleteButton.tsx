"use client";

import { HOST } from "@/app/constant";
import { useState } from "react";

export default function DeleteButton(props: { file_id: string }) {
  const [isClicked, setIsClicked] = useState(false);

  function deleteFile(file_id: string) {
    setIsClicked(true);
    fetch(`${HOST}/api/files/${file_id}`, {
      method: "DELETE",
    }).then((res) => {
      if (res.status) {
        location.reload();
      }
    });
  }

  return (
    <button disabled={isClicked} className="ml-4 text-red-500 disabled:text-gray-400" onClick={() => deleteFile(props.file_id)}>
      削除
    </button>
  );
}
