import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.DATA_GO_KR_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ success: false, message: "금고에서 열쇠를 찾을 수 없습니다." });
  }

  try {
    // 해결 포인트: http -> https 로 변경하여 정부 보안 서버 규격에 맞춥니다.
    const baseUrl = "https://apis.data.go.kr/1421000/mssBizService_v2/getbizList_v2";
    
    // API 키와 파라미터 조합
    const url = `${baseUrl}?serviceKey=${apiKey}&pageNo=1&numOfRows=10`;

    const response = await fetch(url);
    const text = await response.text();
    
    return NextResponse.json({
      success: true,
      message: "정부 데이터 창고 문이 마침내 열렸습니다!",
      detail: text 
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "통신 완전 실패", detail: error.message },
      { status: 500 }
    );
  }
}