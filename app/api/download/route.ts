import {NextRequest} from "next/server";

export async function GET(
  req: NextRequest,
) {
  const imageUrl = req.nextUrl.searchParams.get('imageUrl')
  if (imageUrl === null) {
    return new Response("Image URL is missing", { status: 400 });
  }
  const response = await fetch(imageUrl as string);
  const index = (imageUrl.lastIndexOf("/") + 1) || 0;
  const filename: string = imageUrl ? imageUrl.substring(index) : '';
  return new Response(response.body, {
    headers: {
      ...response.headers, // copy the previous headers
      "content-disposition": `attachment;" filename="${filename}"`,
    },
  });
}
