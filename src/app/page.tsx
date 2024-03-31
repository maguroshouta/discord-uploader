import UploadForm from "@/components/UploadForm";
import { HOST } from "./constant";
import DeleteButton from "@/components/DeleteButton";

export default async function Home() {
  const res_files = await fetch(`${HOST}/api/files`, {
    cache: "no-store",
  });

  const files = await res_files.json();

  if (!res_files.ok) {
    return <p>ファイルの取得に失敗しました</p>;
  }

  return (
    <main className="p-4">
      <UploadForm />
      {files?.length !== 0 && (
        <ul className="mt-4">
          {files?.map((file: any) => (
            <li key={file.file_id} className="flex">
              <a href={`/api/files/${file.file_id}`}>{file.filename}</a>
              <DeleteButton file_id={file.file_id} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
