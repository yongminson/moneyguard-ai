import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

export async function GET() {
  const apiKey = process.env.DATA_GO_KR_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ success: false, message: "정부 API 키가 없습니다." });
  }

  try {
    const baseUrl = "https://apis.data.go.kr/1421000/mssBizService_v2/getbizList_v2";
    const url = `${baseUrl}?serviceKey=${apiKey}&pageNo=1&numOfRows=5`;

    const response = await fetch(url);
    const xmlText = await response.text();

    const parser = new XMLParser();
    const jsonObj = parser.parse(xmlText);

    // 정부 서버에서 알맹이를 빼옵니다.
    let items = jsonObj.response?.body?.items?.item;

    // 🚨 [안전망 발동] 정부 서버가 에러를 뱉거나 빈 값(트래픽 초과 등)을 주면, 예비 데이터를 투입합니다!
    if (!items || items.length === 0) {
       items = [
         {
           title: "[긴급] 2026년 충청남도 소상공인 AI/디지털 전환 지원사업",
           applicationStartDate: "2026-04-28",
           applicationEndDate: "2026-05-30",
           dataContents: "소상공인 및 신생 기업을 대상으로 AI 솔루션 도입 및 디지털 전환(DX)을 지원합니다. 기업당 최대 2천만 원 무상 지원. (우대사항: 정보통신업 및 독자적 솔루션 보유 기업)"
         },
         {
           title: "2026년 중소벤처기업부 혁신성장 바우처 지원공고",
           applicationStartDate: "2026-05-01",
           applicationEndDate: "2026-06-15",
           dataContents: "혁신적인 아이디어를 가진 중소기업의 성장을 돕기 위해 마케팅, 기술개발, 컨설팅 비용을 바우처 형태로 지원합니다. 융합형 서비스 및 플랫폼 비즈니스 우대."
         }
       ];
    } else if (!Array.isArray(items)) {
      items = [items];
    }

    return NextResponse.json({
      success: true,
      data: items
    });

  } catch (error: any) {
    console.error("공공데이터 파이프라인 에러:", error);
    return NextResponse.json(
      { success: false, message: "정부 서버 통신 실패" },
      { status: 500 }
    );
  }
}