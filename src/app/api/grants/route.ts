import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

export async function GET() {
  const apiKey = process.env.DATA_GO_KR_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ success: false, message: "정부 API 마스터키가 없습니다." });
  }

  try {
    let allGrants: any[] = [];

    // 🚀 [엔진 1] 중소벤처기업부 (XML)
    try {
      const url1 = `https://apis.data.go.kr/1421000/mssBizService_v2/getbizList_v2?serviceKey=${apiKey}&pageNo=1&numOfRows=10`;
      const response1 = await fetch(url1);
      const xmlText = await response1.text();
      const parser = new XMLParser();
      const jsonObj = parser.parse(xmlText);
      let items1 = jsonObj.response?.body?.items?.item || [];
      if (!Array.isArray(items1)) items1 = [items1];

      const formatted1 = items1.map((item: any) => ({
        title: item.bizTitle || "중기부 지원사업",
        applicationEndDate: item.reqstEndDt || "상시모집",
        dataContents: item.bizCont || "상세내용 참조",
        source: "중소벤처기업부"
      }));
      allGrants = [...allGrants, ...formatted1];
    } catch (e) { console.error("엔진 1 에러:", e); }

    // 🚀 [엔진 2] 기업마당 국가통합망 (JSON)
    try {
      const url2 = `http://apis.data.go.kr/B552735/BizInfoService/getBizInfoList?serviceKey=${apiKey}&pageNo=1&numOfRows=20&type=json`;
      const response2 = await fetch(url2);
      const data2 = await response2.json();
      let items2 = data2.response?.body?.items || [];
      if (!Array.isArray(items2)) items2 = [items2];

      const formatted2 = items2.map((item: any) => ({
        title: item.pblancNm || "기업마당 지원사업",
        applicationEndDate: item.reqstEndDt || "상시모집",
        dataContents: item.pblancCn || item.sportCn || "상세내용 참조",
        source: "기업마당"
      }));
      allGrants = [...allGrants, ...formatted2];
    } catch (e) { console.error("엔진 2 에러:", e); }

    // 🚀 [엔진 3] K-Startup 창업진흥원 (JSON)
    try {
      // K-Startup API 호출 (승인 직후라 대기 시간이 필요할 수 있음)
      const url3 = `https://apis.data.go.kr/B552735/KStartupService/getKStartupList?serviceKey=${apiKey}&pageNo=1&numOfRows=10&type=json`;
      const response3 = await fetch(url3);
      const data3 = await response3.json();
      let items3 = data3.response?.body?.items || [];
      if (!Array.isArray(items3)) items3 = [items3];

      const formatted3 = items3.map((item: any) => ({
        title: item.pblancNm || "K-Startup 지원사업",
        applicationEndDate: item.reqstEndDt || "상시모집",
        dataContents: item.pblancCn || "초기 창업 패키지 및 지원사업",
        source: "창업진흥원"
      }));
      allGrants = [...allGrants, ...formatted3];
    } catch (e) { console.error("엔진 3 에러 (K-Startup 동기화 중일 수 있음):", e); }

    // 🎯 [핵심] MVP 정밀 타겟팅 필터링 (거름망)
    // - 제목이나 내용에 지역명이 포함되거나, 아예 지역 제한이 없는 '전국/통합' 공고만 살립니다.
    let mvpGrants = allGrants.filter(grant => {
      const text = (grant.title + " " + grant.dataContents).toLowerCase();
      return (
        text.includes('서울') || 
        text.includes('경기') || 
        text.includes('아산') || 
        text.includes('충남') ||
        text.includes('전국') ||
        text.includes('중소기업') // 지역 무관 전국구 공고
      );
    });

    // 중복된 공고명 제거 (깔끔한 UI 제공)
    mvpGrants = mvpGrants.filter((grant, index, self) =>
      index === self.findIndex((t) => (t.title === grant.title))
    );

    // 데이터가 비었을 경우 (동기화 딜레이)
    if (mvpGrants.length === 0) {
      mvpGrants = [
        { title: "[MVP 테스트] 2026년 아산시 청년창업 특례보증", applicationEndDate: "2026-06-30", dataContents: "아산시 소재 창업 5년 이내 기업 대상 자금 지원 (API 동기화 대기중)" },
        { title: "[MVP 테스트] 2026년 서울/경기 지역 혁신성장 바우처", applicationEndDate: "2026-05-20", dataContents: "수도권 소재 IT 기업 대상 바우처 지원 (API 동기화 대기중)" }
      ];
    }

    return NextResponse.json({ success: true, data: mvpGrants.slice(0, 10) }); // 최상위 10개만 전송

  } catch (error: any) {
    console.error("통합 파이프라인 치명적 에러:", error);
    return NextResponse.json({ success: false, message: "정부 서버 통합 통신 실패" }, { status: 500 });
  }
}