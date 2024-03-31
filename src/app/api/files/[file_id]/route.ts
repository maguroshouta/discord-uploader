import { DISCORD_BOT_TOKEN } from "@/app/constant";
import { NextRequest, NextResponse } from "next/server";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(request: NextRequest, { params }: { params: { file_id: string } }) {
  const res_file_message = await fetch(`https://discord.com/api/v10/channels/${process.env.FILE_ID_CHANNEL}/messages/${params.file_id}`, {
    headers: {
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
    },
    cache: "no-store",
  });

  if (!res_file_message.ok) {
    return NextResponse.json({ error: "ファイルの取得に失敗しました" }, { status: 404 });
  }

  const files = [];

  const file_message = await res_file_message.json();

  const file_name = file_message.content.split(":")[2];
  const file_amount = file_message.content.split(":")[4];
  let next_file_id = file_message.content.split(":")[1];

  for (let i = 0; i < file_amount; i++) {
    const res_file = await fetch(`https://discord.com/api/v10/channels/${process.env.FILE_UPLOAD_CHANNEL}/messages/${next_file_id}`, {
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      },
      cache: "no-store",
    });
    const file = await res_file.json();
    console.log(file);
    files.push({ url: file.attachments[0].url, timestamp: file.timestamp });
    if ("message_reference" in file) next_file_id = file.message_reference.message_id;
    await sleep(1000);
  }

  files.sort((a, b) => -new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const blob_array = [];
  for (const file of files) {
    const res_file = await fetch(file.url);
    const file_blob = await res_file.blob();
    blob_array.push(file_blob);
  }

  return new NextResponse(new Blob(blob_array), {
    status: 200,
    headers: { "Content-Type": "application/octet-stream", "Content-Disposition": `attachment; filename=${file_name}` },
  });
}

export async function DELETE(request: NextRequest, { params }: { params: { file_id: string } }) {
  const res_file_message = await fetch(`https://discord.com/api/v10/channels/${process.env.FILE_ID_CHANNEL}/messages/${params.file_id}`, {
    headers: {
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
    },
    cache: "no-store",
  });

  if (!res_file_message.ok) {
    return NextResponse.json({ error: "ファイルの取得に失敗しました" }, { status: 404 });
  }

  const file_message = await res_file_message.json();

  const file_amount = file_message.content.split(":")[4];
  let next_file_id = file_message.content.split(":")[1];

  for (let i = 0; i < file_amount; i++) {
    const res_file = await fetch(`https://discord.com/api/v10/channels/${process.env.FILE_UPLOAD_CHANNEL}/messages/${next_file_id}`, {
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      },
      cache: "no-store",
    });
    await fetch(`https://discord.com/api/v10/channels/${process.env.FILE_UPLOAD_CHANNEL}/messages/${next_file_id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      },
      cache: "no-store",
    });
    const file = await res_file.json();
    if ("message_reference" in file) next_file_id = file.message_reference.message_id;
    await sleep(500);
  }

  const res_delete_file_message = await fetch(`https://discord.com/api/v10/channels/${process.env.FILE_ID_CHANNEL}/messages/${params.file_id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
    },
    cache: "no-store",
  });

  if (!res_delete_file_message.ok) {
    return NextResponse.json({ error: "ファイルの削除に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
