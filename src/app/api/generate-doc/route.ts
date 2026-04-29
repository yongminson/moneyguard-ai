import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    const { 
      companyName, region, industry, mainItem, 
      establishedYear, revenueScale, employeeCount,
      policyName, policyDetail 
    } = await request.json();

    const prompt = `
    너는 대한민국 최고 정부지원금 심사위원이자 컨설턴트야.
    [기업 정보]와 [공고]를 분석해 아래 5가지 섹션으로 완벽하게 구분해서 출력해. JSON이나 마크다운 코드블록 쓰지 말고 순수 텍스트로 반환.

    [기업 정보] 상호: ${companyName}(${region}) / 업종: ${industry} / 업력: ${establishedYear}년 / 매출: ${revenueScale} / 인원: ${employeeCount}명 / 아이템: ${mainItem}
    [공고] ${policyName} (내용: ${policyDetail})

    ---
    [섹션 1: 📊 적격성 및 매칭 진단]
    예상_적격률: (0~100 사이 숫자만. 예: 65)
    [매칭 점수 산정 근거]
    - 업력 (가중치 25%): ... (평가 코멘트)
    - 매출 (가중치 20%): ... (평가 코멘트)
    - 인원 (가중치 15%): ... (평가 코멘트)
    - 업종 적합성 (가중치 25%): ... (평가 코멘트)
    - 아이템 적합성 (가중치 15%): ... (평가 코멘트)

    [섹션 2: 📈 적격률 상승 시뮬레이션]
    현재: 예상_적격률% [보완 필수/검토 필요/지원 가능]
    - ✅ 인력 1명 충원 시: [상승된 예상 적격률]%
    - ✅ 매출 한 단계 상승 시: [상승된 예상 적격률]%
    - ✅ 둘 다 달성 시: [크게 상승된 적격률]% ⭐

    [섹션 3: 💡 핵심 합격 전략]
    - 강점(심사위원이 높게 평가할 점): 1줄
    - 약점 보완(한 줄 코칭): 1줄

    [섹션 4: 🎯 심사위원 매료 5대 키워드]
    1. (키워드) / 2. (키워드) / 3. (키워드) / 4. (키워드) / 5. (키워드)

    [섹션 5: 📝 전문가급 사업계획서 초안]
    (섹션 4의 키워드를 소제목으로 삼아 5개 단락 작성. 사장님이 채워야 할 곳은 [빈칸: 추천값 A / B] 형태로 가이드를 제공할 것.)
    예시: [혁신성] 당사는 [빈칸: 추천값 1년 / 3년 / 5년] 내에 혁신 솔루션을 개발하여 매출 [빈칸: 추천값 5억 / 10억]을 달성할 것입니다.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", 
      messages: [{ role: "user", content: prompt }],
      max_tokens: 3500,
      temperature: 0.3, 
    });

    return NextResponse.json({ success: true, result: completion.choices[0].message.content });
  } catch (error: any) {
    return NextResponse.json({ success: false, detail: error.message }, { status: 500 });
  }
}