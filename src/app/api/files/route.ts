import { DISCORD_BOT_TOKEN } from "@/app/constant";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const res_files = await fetch(`https://discord.com/api/v10/channels/${process.env.FILE_ID_CHANNEL}/messages`, {
    headers: {
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
    },
  });

  if (!res_files.ok) {
    return NextResponse.json({ error: "ファイルの取得に失敗しました" }, { status: 404 });
  }

  const files_json = await res_files.json();

  const files = files_json.map((file: any) => {
    const file_id = file.content.split(":")[0];
    const filename = file.content.split(":")[2];
    return { file_id, filename };
  });

  return NextResponse.json(files);
}

export async function POST(request: Request) {
  const request_formData = await request.formData();
  const file = request_formData.get("file");
  const last_message_id = request_formData.get("last_message_id");
  const index = request_formData.get("index");
  const chunk_count = request_formData.get("chunk_count");
  const file_name = request_formData.get("file_name");
  const file_size = request_formData.get("file_size");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "ファイルがアップロードされていません" }, { status: 400 });
  }

  if (typeof index !== "string" || typeof chunk_count !== "string") {
    return NextResponse.json({ error: "ファイルのアップロードに失敗しました" }, { status: 500 });
  }

  const formData = new FormData();
  formData.append("file", file);

  if (last_message_id) {
    formData.append(
      "payload_json",
      JSON.stringify({
        message_reference: {
          message_id: last_message_id,
        },
      }),
    );
  }

  const res_file_message: Response = await fetch(`https://discord.com/api/v10/channels/${process.env.FILE_UPLOAD_CHANNEL}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
    },
    body: formData,
  });

  if (!res_file_message.ok) {
    return NextResponse.json({ error: "ファイルのアップロードに失敗しました" }, { status: 500 });
  }

  const file_message = await res_file_message.json();

  if (parseInt(index) === parseInt(chunk_count) - 1) {
    const res_file_id_message: Response = await fetch(`https://discord.com/api/v10/channels/${process.env.FILE_ID_CHANNEL}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: `${file_message.id}:${file_name}:${file_size}:${chunk_count}`,
      }),
    });

    if (!res_file_id_message.ok) {
      return NextResponse.json({ error: "ファイルのアップロードに失敗しました" }, { status: 500 });
    }

    const file_id_message = await res_file_id_message.json();

    const res_patch_file_id_message: Response = await fetch(`https://discord.com/api/v10/channels/${process.env.FILE_ID_CHANNEL}/messages/${file_id_message.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: `${file_id_message.id}:${file_message.id}:${file_name}:${file_size}:${chunk_count}`,
      }),
    });

    if (!res_patch_file_id_message.ok) {
      return NextResponse.json({ error: "ファイルのアップロードに失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ id: file_message.id }, { status: 202 });
}
